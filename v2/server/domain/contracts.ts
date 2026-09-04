export const workflowStates = [
  'DRAFT',
  'RECEIVED',
  'INTAKE_VALIDATION',
  'ACCEPTED',
  'SWEEP_PLANNED',
  'SWEEP_ACTIVE',
  'RELEASE_READY',
  'RELEASED',
  'CLOSED',
  'HOLD',
  'QUARANTINED',
  'ESCALATED',
  'CORRECTION_REQUIRED',
  'RETEST_ACTIVE',
  'REJECTED',
  'CANCELLED',
] as const;

export type WorkflowState = (typeof workflowStates)[number];

// StepState remains intentionally open until separately canonized.
export type StepState = string;

// ObjectType remains intentionally open until separately canonized.
export type ObjectType = string;

export const syncStatuses = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'dead_lettered',
] as const;

export type SyncStatus = (typeof syncStatuses)[number];
export type SyncDirection = 'inbound' | 'outbound' | 'reconcile';
export type SyncTarget = 'notion' | 'ghl' | 'database' | 'openai' | 'other';
export type EventClass =
  | 'new'
  | 'duplicate'
  | 'replay'
  | 'retry'
  | 'correction'
  | 'child'
  | 'compensating';

export type JsonObject = Record<string, unknown>;

export interface WorkspaceRow {
  id: string;
  canonical_id: string;
  name: string;
  schema_version: number;
  notion_page_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRow {
  id: string;
  workspace_id: string;
  canonical_id: string;
  external_id: string;
  owner_id: string;
  title: string;
  description: string | null;
  lifecycle_state: WorkflowState;
  version: number;
  source_system: string;
  notion_record_id: string | null;
  ghl_opportunity_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowStepRow {
  id: string;
  workflow_id: string;
  canonical_id: string;
  external_id: string;
  sequence: number;
  name: string;
  description: string | null;
  owner_type: string;
  owner_id: string | null;
  execution_mode: string;
  tool: string | null;
  estimated_minutes: number | null;
  inputs: JsonObject;
  outputs: JsonObject;
  friction: JsonObject;
  verification_required: boolean;
  state: StepState;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  workflow_version: number;
  status: string;
  provider: string | null;
  model: string | null;
  input_snapshot: JsonObject;
  result: JsonObject;
  created_at: string;
  completed_at: string | null;
}

export interface RecommendationRow {
  id: string;
  workspace_id: string;
  workflow_id: string;
  analysis_id: string | null;
  sequence: number;
  title: string;
  action: string;
  rationale: string | null;
  expected_impact: JsonObject;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestRow {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  test_type: string;
  status: string;
  input: JsonObject;
  expected: JsonObject;
  actual: JsonObject | null;
  passed: boolean | null;
  run_at: string | null;
  created_at: string;
}

export interface EvidenceRow {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  workflow_version: number | null;
  object_type: ObjectType;
  object_id: string;
  actor_id: string | null;
  evidence_type: string;
  source_system: string;
  uri: string | null;
  checksum: string | null;
  payload: JsonObject;
  occurred_at: string;
  created_at: string;
}

export interface MetricRow {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  metric_key: string;
  numeric_value: number | null;
  text_value: string | null;
  unit: string | null;
  dimensions: JsonObject;
  measured_at: string;
  created_at: string;
}

export interface IdempotencyKeyRow {
  id: string;
  workspace_id: string;
  operation_id: string;
  idempotency_key: string;
  scope: string;
  request_hash: string;
  status: 'claimed' | 'completed' | 'failed';
  response: JsonObject | null;
  claimed_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export interface DomainEvent<TPayload extends JsonObject = JsonObject> {
  event_id: string;
  operation_id: string;
  idempotency_key: string;
  correlation_id: string;
  causation_id?: string;
  workflow_run_id?: string;
  component_id?: string;
  submodule_id?: string;
  workspace_id: string;
  workflow_id?: string;
  workflow_version?: number;
  aggregate_type: string;
  aggregate_id: string;
  event_type: string;
  event_class: EventClass;
  schema_version: number;
  actor_ref: string;
  source_system: string;
  source_version?: string;
  source_record_version?: string;
  change_payload: JsonObject;
  previous_record_hash?: string;
  record_hash: string;
  is_compensating_entry: boolean;
  compensates_event_id?: string;
  contact_ref?: string;
  opportunity_ref?: string;
  privacy_class: string;
  payload: TPayload;
  occurred_at: string;
}

export interface SyncJob<TPayload extends JsonObject = JsonObject> {
  id: string;
  workspace_id: string;
  workflow_id: string | null;
  operation_id: string;
  idempotency_key_id: string;
  target_system: SyncTarget;
  direction: SyncDirection;
  status: SyncStatus;
  source_version: string | null;
  target_version: string | null;
  payload: TPayload;
  attempt_count: number;
  last_error: string | null;
  next_attempt_at: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface SyncAdapter<TInput, TOutput> {
  readonly target: SyncTarget;
  push(input: TInput): Promise<TOutput>;
  pull?(input: TInput): Promise<TOutput>;
  reconcile?(input: TInput): Promise<TOutput>;
}
