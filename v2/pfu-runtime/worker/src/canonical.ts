import { randomUUID } from "node:crypto";

import { isRepositoryAllowed, sha256Payload } from "./security.js";
import type {
  AuthorizationVerdict,
  CanonicalEvent,
  GitHubWebhookInput,
} from "./types.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function stringValue(record: UnknownRecord | null, key: string): string | null {
  const value = record?.[key];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function nestedRecord(record: UnknownRecord, key: string): UnknownRecord | null {
  return asRecord(record[key]);
}

function firstTimestamp(
  candidates: Array<string | null>,
  fallback: Date,
): string {
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = new Date(candidate);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return fallback.toISOString();
}

function resolveEntity(body: UnknownRecord, eventName: string): {
  entityType: string | null;
  entityId: string | null;
} {
  const candidates: Array<[string, UnknownRecord | null, string[]]> = [
    ["pull_request", nestedRecord(body, "pull_request"), ["id", "number"]],
    ["release", nestedRecord(body, "release"), ["id", "tag_name"]],
    ["check_run", nestedRecord(body, "check_run"), ["id", "node_id"]],
    ["check_suite", nestedRecord(body, "check_suite"), ["id", "node_id"]],
    ["workflow_run", nestedRecord(body, "workflow_run"), ["id", "node_id"]],
    ["issue", nestedRecord(body, "issue"), ["id", "number"]],
  ];

  for (const [entityType, record, keys] of candidates) {
    if (!record) continue;
    for (const key of keys) {
      const entityId = stringValue(record, key);
      if (entityId) return { entityType, entityId };
    }
  }

  if (eventName === "push") {
    return {
      entityType: "commit",
      entityId: stringValue(body, "after"),
    };
  }

  return { entityType: null, entityId: null };
}

function resolveBranch(body: UnknownRecord): string | null {
  const pullRequest = nestedRecord(body, "pull_request");
  const pullRequestHead = pullRequest
    ? nestedRecord(pullRequest, "head")
    : null;
  const workflowRun = nestedRecord(body, "workflow_run");

  const pullRequestBranch = stringValue(pullRequestHead, "ref");
  if (pullRequestBranch) return pullRequestBranch;

  const workflowBranch = stringValue(workflowRun, "head_branch");
  if (workflowBranch) return workflowBranch;

  const ref = stringValue(body, "ref");
  return ref?.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
}

export function canonicalizeGitHubEvent(
  input: GitHubWebhookInput,
  allowedRepositories: ReadonlySet<string>,
): CanonicalEvent {
  const receivedAt = input.receivedAt ?? new Date();
  const repositoryRecord = nestedRecord(input.body, "repository");
  const repository = stringValue(repositoryRecord, "full_name");
  const sender = nestedRecord(input.body, "sender");
  const action = stringValue(input.body, "action");
  const eventType = action ? `${input.eventName}.${action}` : input.eventName;
  const entity = resolveEntity(input.body, input.eventName);

  const pullRequest = nestedRecord(input.body, "pull_request");
  const release = nestedRecord(input.body, "release");
  const checkRun = nestedRecord(input.body, "check_run");
  const workflowRun = nestedRecord(input.body, "workflow_run");
  const headCommit = nestedRecord(input.body, "head_commit");

  const verdict: AuthorizationVerdict = isRepositoryAllowed(
    repository,
    allowedRepositories,
  )
    ? "AUTHORIZED"
    : "DENIED";

  return {
    event_id: randomUUID(),
    source_system: "github",
    source_event_id: input.deliveryId,
    event_type: eventType,
    entity_type: entity.entityType,
    entity_id: entity.entityId,
    repository,
    branch: resolveBranch(input.body),
    actor_id: stringValue(sender, "id") ?? stringValue(sender, "login"),
    correlation_id: randomUUID(),
    causation_id: null,
    idempotency_key: `github:${input.deliveryId}`,
    payload_hash: sha256Payload(input.rawBody),
    payload: input.body,
    occurred_at: firstTimestamp(
      [
        stringValue(pullRequest, "updated_at"),
        stringValue(release, "published_at"),
        stringValue(checkRun, "completed_at"),
        stringValue(checkRun, "started_at"),
        stringValue(workflowRun, "updated_at"),
        stringValue(headCommit, "timestamp"),
      ],
      receivedAt,
    ),
    received_at: receivedAt.toISOString(),
    authorization_verdict: verdict,
  };
}
