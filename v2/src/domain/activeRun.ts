import { z } from 'zod';

import {
  transformationAcceptanceSchema,
  transformationEvidenceSchema,
  transformationResultSchema,
  type TransformationAcceptance,
  type TransformationEvidence,
  type TransformationResult,
} from './transformation';

export const activeRunSessionSchema = z
  .object({
    version: z.literal(1),
    result: transformationResultSchema,
    acceptance: transformationAcceptanceSchema.nullable(),
    evidence: transformationEvidenceSchema.nullable(),
  })
  .superRefine((session, context) => {
    if (
      session.acceptance &&
      session.acceptance.runId !== session.result.id
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Acceptance must belong to the active transformation run.',
        path: ['acceptance', 'runId'],
      });
    }

    if (session.evidence && session.evidence.runId !== session.result.id) {
      context.addIssue({
        code: 'custom',
        message: 'Evidence must belong to the active transformation run.',
        path: ['evidence', 'runId'],
      });
    }

    if (session.evidence && !session.acceptance) {
      context.addIssue({
        code: 'custom',
        message: 'Evidence cannot exist before the active run is accepted.',
        path: ['evidence'],
      });
    }
  });

export type ActiveRunSession = z.infer<typeof activeRunSessionSchema>;

export function createActiveRunSession(
  result: TransformationResult,
  acceptance: TransformationAcceptance | null = null,
  evidence: TransformationEvidence | null = null,
): ActiveRunSession {
  return activeRunSessionSchema.parse({
    version: 1,
    result,
    acceptance,
    evidence,
  });
}
