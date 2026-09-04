import { z } from 'zod';

export const AUTONOMOUS_OS_VERSION = '1.0.0' as const;
export const AUTONOMOUS_OS_RUNTIME_CEILING = 'A2' as const;

export const AUTONOMY_LEVELS = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] as const;
export const autonomyLevelSchema = z.enum(AUTONOMY_LEVELS);
export type AutonomyLevel = z.infer<typeof autonomyLevelSchema>;

export const AUTONOMOUS_OS_LAWS = [
  'NO_SELF_CREATED_AUTHORITY',
  'NO_SILENT_SCOPE_EXPANSION',
  'NO_STATE_PROMOTION_WITHOUT_EVIDENCE',
  'NO_PRODUCTION_TRANSITION_WITHOUT_AUTHORITY',
  'NO_POLICY_MODIFICATION_THROUGH_LEARNING',
  'NO_DESTRUCTIVE_ACTION_WITHOUT_RECOVERY_AUTHORITY',
  'NO_CONCEALMENT_OF_FAILURE_OR_UNCERTAINTY',
] as const;

export const autonomousCapabilitySchema = z.enum([
  'OBSERVE',
  'RECOMMEND',
  'PREPARE',
  'EVIDENCE_WRITE',
  'ESCALATE',
  'EXECUTE_BOUNDED',
  'RECOVER',
  'CONTINUE_BOUNDED',
]);
export type AutonomousCapability = z.infer<typeof autonomousCapabilitySchema>;

export const AUTONOMOUS_PROHIBITED_ACTIONS = [
  ...AUTONOMOUS_OS_LAWS,
  'PUBLIC_PUBLISH',
  'PRICE_CHANGE',
  'LEGAL_TERMS_CHANGE',
  'PRODUCTION_DEPLOY',
  'CUSTOMER_FINANCIAL_EXECUTION',
  'UNBOUNDED_EXTERNAL_WRITE',
] as const;
export const autonomousProhibitedActionSchema = z.enum(
  AUTONOMOUS_PROHIBITED_ACTIONS,
);
export type AutonomousProhibitedAction = z.infer<
  typeof autonomousProhibitedActionSchema
>;

export const autonomousMissionStateSchema = z.enum([
  'CREATED',
  'AUTHORIZED',
  'PLANNED',
  'EXECUTING',
  'RECOVERING',
  'BLOCKED',
  'ESCALATED',
  'COMPLETED',
  'FAILED',
]);
export type AutonomousMissionState = z.infer<
  typeof autonomousMissionStateSchema
>;

export const autonomousMissionEnvironmentSchema = z.enum([
  'LOCAL',
  'TEST',
  'STAGING',
  'PREVIEW',
]);
export type AutonomousMissionEnvironment = z.infer<
  typeof autonomousMissionEnvironmentSchema
>;

const prohibitedActionsSchema = z
  .array(autonomousProhibitedActionSchema)
  .min(AUTONOMOUS_OS_LAWS.length)
  .superRefine((actions, context) => {
    for (const law of AUTONOMOUS_OS_LAWS) {
      if (!actions.includes(law)) {
        context.addIssue({
          code: 'custom',
          message: `Missing permanent autonomous guardrail: ${law}`,
        });
      }
    }
  });

export const autonomousAuthorityRequestSchema = z.object({
  authoritySource: z.string().min(1).max(200),
  policyVersion: z.string().min(1).max(100),
  environment: autonomousMissionEnvironmentSchema,
  allowedCapabilities: z.array(autonomousCapabilitySchema).min(1),
  prohibitedActions: prohibitedActionsSchema,
  expiresAt: z.string().datetime().optional(),
});

export const autonomousMissionEvidenceRequirementSchema = z.object({
  requirementId: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  requiredBeforeCompletion: z.boolean().default(true),
});

export const autonomousMissionStopConditionSchema = z.object({
  conditionId: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  action: z.enum(['STOP', 'ESCALATE', 'BLOCK']),
});

export const autonomousMissionDraftSchema = z.object({
  missionId: z.string().uuid(),
  objective: z.string().min(3).max(1000),
  desiredState: z.string().min(1).max(500),
  target: z.object({
    system: z.string().min(1).max(100),
    objectType: z.string().min(1).max(100),
    objectId: z.string().min(1).max(200),
  }),
  autonomyLevel: autonomyLevelSchema,
  authorityRequest: autonomousAuthorityRequestSchema,
  constraints: z.object({
    riskCeiling: z.enum(['LOW', 'MODERATE']),
    maxAttempts: z.number().int().min(1).max(20),
    maxSpendCad: z.number().min(0).max(100000),
    deadline: z.string().datetime().optional(),
  }),
  evidenceRequirements: z
    .array(autonomousMissionEvidenceRequirementSchema)
    .min(1),
  stopConditions: z.array(autonomousMissionStopConditionSchema).min(1),
  completionDefinition: z.string().min(3).max(1000),
});
export type AutonomousMissionDraft = z.infer<typeof autonomousMissionDraftSchema>;

export const autonomousMissionAuthorizationSchema = z.object({
  grantedBy: z.string().min(1).max(200),
  policyVersion: z.string().min(1).max(100),
  grantedCapabilities: z.array(autonomousCapabilitySchema).min(1),
  runtimeCeiling: z.literal(AUTONOMOUS_OS_RUNTIME_CEILING),
  grantedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});
export type AutonomousMissionAuthorization = z.infer<
  typeof autonomousMissionAuthorizationSchema
>;

export const autonomousMissionPlanStepSchema = z.object({
  stepId: z.string().min(1).max(100),
  capability: autonomousCapabilitySchema,
  description: z.string().min(1).max(500),
  evidenceRequirementIds: z.array(z.string().min(1).max(100)).default([]),
});
export type AutonomousMissionPlanStep = z.infer<
  typeof autonomousMissionPlanStepSchema
>;

export const autonomousMissionEvidenceSchema = z.object({
  evidenceId: z.string().min(1).max(200),
  requirementId: z.string().min(1).max(100),
  summary: z.string().min(1).max(1000),
  provenance: z.string().min(1).max(300),
  createdAt: z.string().datetime(),
});
export type AutonomousMissionEvidence = z.infer<
  typeof autonomousMissionEvidenceSchema
>;

export const autonomousMissionEventSchema = z.object({
  eventId: z.string().min(1).max(200),
  type: z.enum([
    'CREATED',
    'AUTHORIZATION_ALLOWED',
    'AUTHORIZATION_DENIED',
    'PLANNED',
    'EVIDENCE_RECORDED',
    'BLOCKED',
    'ESCALATED',
    'COMPLETED',
    'FAILED',
  ]),
  at: z.string().datetime(),
  summary: z.string().min(1).max(1000),
});
export type AutonomousMissionEvent = z.infer<typeof autonomousMissionEventSchema>;

export const autonomousMissionSchema = autonomousMissionDraftSchema.extend({
  schemaVersion: z.literal(AUTONOMOUS_OS_VERSION),
  state: autonomousMissionStateSchema,
  authorization: autonomousMissionAuthorizationSchema.nullable(),
  plan: z.array(autonomousMissionPlanStepSchema),
  evidence: z.array(autonomousMissionEvidenceSchema),
  events: z.array(autonomousMissionEventSchema).min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type AutonomousMission = z.infer<typeof autonomousMissionSchema>;

export function isAutonomyLevelAdmitted(level: AutonomyLevel): boolean {
  return (
    AUTONOMY_LEVELS.indexOf(level) <=
    AUTONOMY_LEVELS.indexOf(AUTONOMOUS_OS_RUNTIME_CEILING)
  );
}

export function minimumLevelForCapability(
  capability: AutonomousCapability,
): AutonomyLevel {
  switch (capability) {
    case 'OBSERVE':
      return 'A0';
    case 'RECOMMEND':
    case 'ESCALATE':
      return 'A1';
    case 'PREPARE':
    case 'EVIDENCE_WRITE':
      return 'A2';
    case 'EXECUTE_BOUNDED':
      return 'A3';
    case 'RECOVER':
      return 'A4';
    case 'CONTINUE_BOUNDED':
      return 'A5';
  }
}

export function capabilityFitsAutonomyLevel(
  capability: AutonomousCapability,
  level: AutonomyLevel,
): boolean {
  return (
    AUTONOMY_LEVELS.indexOf(minimumLevelForCapability(capability)) <=
    AUTONOMY_LEVELS.indexOf(level)
  );
}
