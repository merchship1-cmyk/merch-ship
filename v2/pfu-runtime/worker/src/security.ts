import * as crypto from "node:crypto";

export class SignatureVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignatureVerificationError";
  }
}

export function verifyGitHubSignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string | undefined,
): void {
  if (!secret) {
    throw new SignatureVerificationError(
      "GITHUB_WEBHOOK_SECRET is not configured",
    );
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    throw new SignatureVerificationError(
      "X-Hub-Signature-256 is missing or malformed",
    );
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex")}`;

  const actualBuffer = Buffer.from(signatureHeader, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    throw new SignatureVerificationError("GitHub signature is invalid");
  }
}

export function sha256Payload(rawBody: string): string {
  return `sha256:${crypto.createHash("sha256").update(rawBody, "utf8").digest("hex")}`;
}

export function parseRepositoryAllowlist(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0),
  );
}

export function isRepositoryAllowed(
  repository: string | null,
  allowlist: ReadonlySet<string>,
): boolean {
  return repository !== null && allowlist.has(repository.toLowerCase());
}
