import assert from "node:assert/strict";
import test from "node:test";

import { canonicalizeGitHubEvent } from "../src/canonical.js";

test("canonicalizes an authorized pull request event", () => {
  const envelope = canonicalizeGitHubEvent(
    {
      deliveryId: "delivery-123",
      eventName: "pull_request",
      rawBody: '{"action":"closed"}',
      receivedAt: new Date("2026-08-04T18:47:00.000Z"),
      body: {
        action: "closed",
        repository: { full_name: "merchship1-cmyk/merch-ship" },
        sender: { id: 42, login: "ryan" },
        pull_request: {
          id: 9001,
          number: 17,
          updated_at: "2026-08-04T18:46:59.000Z",
          head: { ref: "agent/install-pfu-autonomous-runtime-v1" },
        },
      },
    },
    new Set(["merchship1-cmyk/merch-ship"]),
  );

  assert.equal(envelope.source_system, "github");
  assert.equal(envelope.source_event_id, "delivery-123");
  assert.equal(envelope.event_type, "pull_request.closed");
  assert.equal(envelope.entity_type, "pull_request");
  assert.equal(envelope.entity_id, "9001");
  assert.equal(envelope.repository, "merchship1-cmyk/merch-ship");
  assert.equal(envelope.branch, "agent/install-pfu-autonomous-runtime-v1");
  assert.equal(envelope.actor_id, "42");
  assert.equal(envelope.authorization_verdict, "AUTHORIZED");
  assert.equal(envelope.idempotency_key, "github:delivery-123");
  assert.equal(envelope.occurred_at, "2026-08-04T18:46:59.000Z");
  assert.match(envelope.payload_hash, /^sha256:[0-9a-f]{64}$/);
  assert.match(envelope.event_id, /^[0-9a-f-]{36}$/);
  assert.match(envelope.correlation_id, /^[0-9a-f-]{36}$/);
});

test("denies an event from a repository outside the allowlist", () => {
  const envelope = canonicalizeGitHubEvent(
    {
      deliveryId: "delivery-denied",
      eventName: "push",
      rawBody: "{}",
      receivedAt: new Date("2026-08-04T18:47:00.000Z"),
      body: {
        repository: { full_name: "other/repository" },
        ref: "refs/heads/main",
        after: "abc123",
      },
    },
    new Set(["merchship1-cmyk/merch-ship"]),
  );

  assert.equal(envelope.authorization_verdict, "DENIED");
  assert.equal(envelope.entity_type, "commit");
  assert.equal(envelope.entity_id, "abc123");
  assert.equal(envelope.branch, "main");
});
