import { z } from 'zod';

import { syncStatuses, workflowStates } from '../domain/contracts';

export const workflowStateSchema = z.enum(workflowStates);
export const syncStatusSchema = z.enum(syncStatuses);
export const syncDirectionSchema = z.enum(['inbound', 'outbound', 'reconcile']);
export const syncTargetSchema = z.enum(['notion', 'ghl', 'database', 'openai', 'other']);
export const eventClassSchema = z.enum([
  'new',
  'duplicate',
  'replay',
  'retry',
  'correction',
  'child',
  'compensating',
]);

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const domainEventSchema = z
  .object({
    event_id: z.string().min(1),
    operation_id: z.string().min(1),
    idempotency_key: z.string().min(1),
    correlation_id: z.string().min(1),
    causation_id: z.string().min(1).optional(),
    workflow_run_id: z.string().min(1).optional(),
    component_id: z.string().min(1).optional(),
    submodule_id: z.string().min(1).optional(),
    workspace_id: z.string().uuid(),
    workflow_id: z.string().uuid().optional(),
    workflow_version: z.number().int().positive().optional(),
    aggregate_type: z.string().min(1),
    aggregate_id: z.string().min(1),
    event_type: z.string().min(1),
    event_class: eventClassSchema,
    schema_version: z.number().int().positive(),
    actor_ref: z.string().min(1),
    source_system: z.string().min(1),
    source_version: z.string().min(1).optional(),
    source_record_version: z.string().min(1).optional(),
    change_payload: jsonObjectSchema,
    previous_record_hash: z.string().min(1).optional(),
    record_hash: z.string().min(1),
    is_compensating_entry: z.boolean(),
    compensates_event_id: z.string().min(1).optional(),
    contact_ref: z.string().min(1).optional(),
    opportunity_ref: z.string().min(1).optional(),
    privacy_class: z.string().min(1),
    payload: jsonObjectSchema,
    occurred_at: z.string().datetime(),
  })
  .superRefine((value, context) => {
    const hasCompensationTarget = Boolean(value.compensates_event_id);
    if (value.is_compensating_entry !== hasCompensationTarget) {
      context.addIssue({
        code: 'custom',
        path: ['compensates_event_id'],
        message:
          'Compensating events must identify the event they compensate, and non-compensating events must not.',
      });
    }
  });

export const syncJobSchema = z.object({
  id: z.string().uuid(),
  workspace_id: z.string().uuid(),
  workflow_id: z.string().uuid().nullable(),
  operation_id: z.string().min(1),
  idempotency_key_id: z.string().uuid(),
  target_system: syncTargetSchema,
  direction: syncDirectionSchema,
  status: syncStatusSchema,
  source_version: z.string().nullable(),
  target_version: z.string().nullable(),
  payload: jsonObjectSchema,
  attempt_count: z.number().int().positive(),
  last_error: z.string().nullable(),
  next_attempt_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});
