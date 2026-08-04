export type SourceSystem = "github" | "notion" | "ghl" | "pfu";

export type AuthorizationVerdict =
  | "PENDING"
  | "AUTHORIZED"
  | "DENIED"
  | "QUARANTINED";

export type ProcessingState =
  | "RECEIVED"
  | "VALIDATED"
  | "AUTHORIZED"
  | "PROCESSING"
  | "COMPLETED"
  | "RETRY_PENDING"
  | "FAILED"
  | "QUARANTINED"
  | "RECONCILIATION_REQUIRED";

export interface CanonicalEvent {
  event_id: string;
  source_system: SourceSystem;
  source_event_id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  repository: string | null;
  branch: string | null;
  actor_id: string | null;
  correlation_id: string;
  causation_id: string | null;
  idempotency_key: string;
  payload_hash: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  received_at: string;
  authorization_verdict: AuthorizationVerdict;
}

export interface IngestResult {
  eventId: string;
  inserted: boolean;
}

export interface ProcessingRecord {
  processing_id: string;
  event_id: string;
  correlation_id: string;
  state: ProcessingState;
  attempt_number: number;
  worker_delivery_id: string;
  detail: Record<string, unknown>;
  recorded_at: string;
}

export interface EvidenceRecord {
  evidence_id: string;
  event_id: string;
  correlation_id: string;
  evidence_type: string;
  control_id: string;
  verdict: AuthorizationVerdict | "PASS" | "FAIL";
  evidence: Record<string, unknown>;
  recorded_at: string;
}

export interface GitHubWebhookInput {
  deliveryId: string;
  eventName: string;
  rawBody: string;
  body: Record<string, unknown>;
  receivedAt?: Date;
}
