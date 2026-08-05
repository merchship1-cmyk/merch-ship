import assert from "node:assert/strict";
import test from "node:test";

import {
  isRepositoryAllowed,
  parseRepositoryAllowlist,
  sha256Payload,
  SignatureVerificationError,
  verifyGitHubSignature,
} from "../src/security.js";

test("accepts GitHub's published HMAC-SHA256 test vector", () => {
  verifyGitHubSignature(
    "Hello, World!",
    "sha256=757107ea0eb2509fc211221cce984b8a37570b6d7586c22c46f4379c8b043e17",
    "It's a Secret to Everybody",
  );
});

test("rejects invalid signatures", () => {
  assert.throws(
    () => verifyGitHubSignature("payload", "sha256=deadbeef", "secret"),
    SignatureVerificationError,
  );
});

test("normalizes exact repository allowlist entries", () => {
  const allowlist = parseRepositoryAllowlist(
    " merchship1-cmyk/merch-ship,Example/Repo ",
  );

  assert.equal(
    isRepositoryAllowed("merchship1-cmyk/merch-ship", allowlist),
    true,
  );
  assert.equal(isRepositoryAllowed("example/repo", allowlist), true);
  assert.equal(isRepositoryAllowed("example/other", allowlist), false);
});

test("produces a prefixed SHA-256 payload hash", () => {
  assert.match(sha256Payload("payload"), /^sha256:[0-9a-f]{64}$/);
});
