import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPaths = [
  resolve('supabase/migrations/202607230001_sync_machine_core.sql'),
  resolve('supabase/migrations/202607230002_align_sync_machine_contract.sql'),
];

const sql = migrationPaths.map((path) => readFileSync(path, 'utf8')).join('\n');

const requiredTables = [
  'workspaces',
  'workflows',
  'workflow_steps',
  'analyses',
  'recommendations',
  'tests',
  'evidence',
  'metrics',
  'events',
  'sync_jobs',
  'idempotency_keys',
] as const;

for (const table of requiredTables) {
  const pattern = new RegExp(`create table if not exists public\\.${table}\\b`, 'i');
  if (!pattern.test(sql)) {
    throw new Error(`Missing required Sync Machine table: ${table}`);
  }
}

const requiredWorkflowStates = [
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

for (const state of requiredWorkflowStates) {
  if (!sql.includes(`'${state}'`)) {
    throw new Error(`Missing canonical WorkflowState: ${state}`);
  }
}

const requiredSyncStatuses = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'dead_lettered',
] as const;

for (const status of requiredSyncStatuses) {
  if (!sql.includes(`'${status}'`)) {
    throw new Error(`Missing canonical SyncStatus: ${status}`);
  }
}

const requiredEnvelopeFields = [
  'event_id',
  'operation_id',
  'idempotency_key',
  'correlation_id',
  'causation_id',
  'workflow_run_id',
  'source_record_version',
  'change_payload',
  'previous_record_hash',
  'record_hash',
  'is_compensating_entry',
  'compensates_event_id',
] as const;

for (const field of requiredEnvelopeFields) {
  if (!sql.includes(field)) {
    throw new Error(`Missing governed event field: ${field}`);
  }
}

if (!sql.includes('prevent_event_mutation')) {
  throw new Error('Append-only event protection is missing.');
}

if (!sql.includes('unique (workspace_id, operation_id)')) {
  throw new Error('Operation identity uniqueness is missing.');
}

if (!sql.includes('unique (workspace_id, idempotency_key)')) {
  throw new Error('Idempotency-key uniqueness is missing.');
}

if (!sql.includes('revoke all on public.events from anon, authenticated')) {
  throw new Error('Direct client writes to governed events are not blocked.');
}

console.log(
  `Sync Machine migration contract validated across ${requiredTables.length} tables.`,
);
