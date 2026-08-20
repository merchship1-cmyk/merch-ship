import { z } from 'zod';

const planStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  action: z.string().min(1),
  definitionOfDone: z.string().min(1),
});

const scheduleItemSchema = z.object({
  label: z.string().min(1),
  action: z.string().min(1),
  durationMinutes: z.number().int().positive().max(240),
});

export const transformationResultSchema = z.object({
  id: z.string().min(1),
  sourceInput: z.string().min(3).max(4000),
  objective: z.string().min(1),
  idea: z.object({
    signal: z.string().min(1),
    finishLine: z.string().min(1),
  }),
  plan: z.array(planStepSchema).min(3).max(5),
  createdOutput: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
  }),
  schedule: z.array(scheduleItemSchema).min(2).max(4),
  review: z.object({
    prompt: z.string().min(1),
    successCriteria: z.array(z.string().min(1)).min(2).max(5),
  }),
  generatedAt: z.string().datetime(),
});

export const transformationAcceptanceSchema = z.object({
  runId: z.string().min(1),
  accepted: z.literal(true),
  acceptedAt: z.string().datetime(),
});

export const transformationEvidenceSchema = z.object({
  runId: z.string().min(1),
  timeSavedMinutes: z.number().int().nonnegative().max(10080),
  stepsRemoved: z.number().int().nonnegative().max(1000),
  clarityGain: z.number().int().min(1).max(5),
  outputProduced: z.boolean(),
  wouldUseAgain: z.boolean(),
  notes: z.string().max(1000).optional(),
  recordedAt: z.string().datetime(),
});

export type TransformationResult = z.infer<
  typeof transformationResultSchema
>;
export type TransformationAcceptance = z.infer<
  typeof transformationAcceptanceSchema
>;
export type TransformationEvidence = z.infer<
  typeof transformationEvidenceSchema
>;
