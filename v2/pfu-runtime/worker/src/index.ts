import { randomUUID } from "node:crypto";

import { WebhookVerificationError, Worker } from "@notionhq/workers";

import { canonicalizeGitHubEvent } from "./canonical.js";
import {
  parseRepositoryAllowlist,
  SignatureVerificationError,
  verifyGitHubSignature,
} from "./security.js";
import {
  appendEvidence,
  appendProcessing,
  ingestEvent,
} from "./supabase.js";
import type { ProcessingState } from "./types.js";

const worker = new Worker();
export default worker;

function requiredHeader(
  headers: Record<string, string>,
  name: string,
): string {
  const value = headers[name];
  if (!value) {
    throw new WebhookVerificationError(`Required GitHub header missing: ${name}`);
  }
  return value;
}

async function recordState(input: {
  eventId: string;
  correlationId: string;
  workerDeliveryId: string;
  state: ProcessingState;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await appendProcessing({
    processing_id: randomUUID(),
    event_id: input.eventId,
    correlation_id: input.correlationId,
    state: input.state,
    attempt_number: 1,
    worker_delivery_id: input.workerDeliveryId,
    detail: input.detail ?? {},
    recorded_at: new Date().toISOString(),
  });
}

worker.webhook("githubEventIngress", {
  title: "PFU GitHub Event Ingress",
  description:
    "Verifies, authorizes, deduplicates, normalizes, and persists GitHub execution events.",
  execute: async (events) => {
    for (const event of events) {
      try {
        verifyGitHubSignature(
          event.rawBody,
          event.headers["x-hub-signature-256"],
          process.env.GITHUB_WEBHOOK_SECRET,
        );
      } catch (error) {
        if (error instanceof SignatureVerificationError) {
          throw new WebhookVerificationError(error.message);
        }
        throw error;
      }

      const githubDeliveryId = requiredHeader(
        event.headers,
        "x-github-delivery",
      );
      const githubEventName = requiredHeader(event.headers, "x-github-event");
      const allowlist = parseRepositoryAllowlist(
        process.env.PFU_ALLOWED_REPOSITORIES,
      );

      const envelope = canonicalizeGitHubEvent(
        {
          deliveryId: githubDeliveryId,
          eventName: githubEventName,
          rawBody: event.rawBody,
          body: event.body,
        },
        allowlist,
      );

      const persisted = await ingestEvent(envelope);
      const eventId = persisted.eventId;

      await recordState({
        eventId,
        correlationId: envelope.correlation_id,
        workerDeliveryId: event.deliveryId,
        state: "RECEIVED",
        detail: {
          inserted: persisted.inserted,
          source_event_id: envelope.source_event_id,
        },
      });

      if (!persisted.inserted) {
        await recordState({
          eventId,
          correlationId: envelope.correlation_id,
          workerDeliveryId: event.deliveryId,
          state: "COMPLETED",
          detail: {
            duplicate: true,
            side_effects_dispatched: false,
          },
        });
        continue;
      }

      await recordState({
        eventId,
        correlationId: envelope.correlation_id,
        workerDeliveryId: event.deliveryId,
        state: "VALIDATED",
        detail: {
          signature: "PASS",
          payload_hash: envelope.payload_hash,
        },
      });

      await appendEvidence({
        evidence_id: eventId,
        event_id: eventId,
        correlation_id: envelope.correlation_id,
        evidence_type: "AUTHORIZATION_VERDICT",
        control_id: "PFU-EVENT-INGRESS-001",
        verdict: envelope.authorization_verdict,
        evidence: {
          repository: envelope.repository,
          allowlist_match: envelope.authorization_verdict === "AUTHORIZED",
          notion_projection_enabled: false,
          ghl_dispatch_enabled: false,
        },
        recorded_at: new Date().toISOString(),
      });

      if (envelope.authorization_verdict !== "AUTHORIZED") {
        await recordState({
          eventId,
          correlationId: envelope.correlation_id,
          workerDeliveryId: event.deliveryId,
          state: "QUARANTINED",
          detail: {
            reason: "Repository is not present in PFU_ALLOWED_REPOSITORIES",
            side_effects_dispatched: false,
          },
        });
        continue;
      }

      await recordState({
        eventId,
        correlationId: envelope.correlation_id,
        workerDeliveryId: event.deliveryId,
        state: "AUTHORIZED",
        detail: {
          repository: envelope.repository,
          side_effects_dispatched: false,
        },
      });

      await recordState({
        eventId,
        correlationId: envelope.correlation_id,
        workerDeliveryId: event.deliveryId,
        state: "COMPLETED",
        detail: {
          persisted_before_projection: true,
          notion_projection_enabled: false,
          ghl_dispatch_enabled: false,
        },
      });
    }
  },
});
