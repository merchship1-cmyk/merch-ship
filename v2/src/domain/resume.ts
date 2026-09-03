import { z } from 'zod';

import {
  transformationAcceptanceSchema,
  transformationEvidenceSchema,
  transformationResultSchema,
  type TransformationAcceptance,
  type TransformationEvidence,
  type TransformationResult,
} from './transformation';

export const resumeStateSchema = z
  .object({
    result: transformationResultSchema.nullable(),
    acceptance: transformationAcceptanceSchema.nullable(),
    evidence: transformationEvidenceSchema.nullable(),
    updatedAt: z.string().datetime(),
  })
  .superRefine((value, context) => {
    if (!value.result && (value.acceptance || value.evidence)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Acceptance or evidence cannot exist without a transformation result.',
      });
      return;
    }

    if (value.result && value.acceptance?.runId !== undefined) {
      if (value.acceptance.runId !== value.result.id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Acceptance must belong to the persisted transformation result.',
        });
      }
    }

    if (value.evidence && !value.acceptance) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Outcome evidence cannot exist before acceptance.',
      });
    }

    if (value.result && value.evidence?.runId !== undefined) {
      if (value.evidence.runId !== value.result.id) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Evidence must belong to the persisted transformation result.',
        });
      }
    }
  });

export type ResumeState = z.infer<typeof resumeStateSchema>;

export function createResumeState(
  result: TransformationResult | null,
  acceptance: TransformationAcceptance | null,
  evidence: TransformationEvidence | null,
  now = new Date(),
): ResumeState {
  return resumeStateSchema.parse({
    result,
    acceptance,
    evidence,
    updatedAt: now.toISOString(),
  });
}
