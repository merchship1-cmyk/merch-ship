import { z } from 'zod';

export const ZENZY_MESH_CLIENT_ID = 'ZENZY_APP' as const;
export const ZENZY_MESH_PREVIEW_PHASE = 'PHASE_1B_PREVIEW' as const;
export const GOV_OS_PREVIEW_POLICY = 'GOV_OS_PREVIEW_0_1' as const;

export const meshWorkflowIdSchema = z.enum([
  'PFU_WEEKLY_PLAN_V0_1',
  'ZENZY_TRANSFORMATION_V0_1',
]);

export const meshAgentIdSchema = z.enum([
  'PFU_AGENT',
  'ZENZY_TRANSFORMATION_AGENT',
  'GOVERNANCE_AGENT',
]);

export const meshRequestSchema = z.object({
  requestId: z.string().min(1),
  client: z.object({
    clientId: z.string().min(1),
    phase: z.string().min(1),
    appVersion: z.string().min(1),
    buildRef: z.string().min(1),
  }),
  actor: z.object({
    userId: z.string().min(1),
    roles: z.array(z.string().min(1)).min(1),
  }),
  session: z.object({
    sessionId: z.string().min(1),
    workflowId: meshWorkflowIdSchema,
  }),
  intent: z.object({
    type: z.enum(['PLAN_WEEK', 'TRANSFORM_WORK']),
    goal: z.string().min(3).max(4000),
  }),
  constraints: z.object({
    mode: z.literal('PREVIEW'),
    destructiveActions: z.boolean(),
    externalPublish: z.boolean(),
    financialExecution: z.boolean(),
    liveToolExecution: z.boolean(),
  }),
});

export const meshGovernanceDecisionSchema = z.discriminatedUnion('decision', [
  z.object({
    decision: z.literal('ALLOW'),
    policyVersion: z.literal(GOV_OS_PREVIEW_POLICY),
    authority: z.literal('PLAN_PREVIEW_ONLY'),
  }),
  z.object({
    decision: z.literal('DENY'),
    policyVersion: z.literal(GOV_OS_PREVIEW_POLICY),
    reasonCode: z.enum([
      'CLIENT_NOT_REGISTERED',
      'PHASE_NOT_ALLOWED',
      'WORKFLOW_NOT_ALLOWED',
      'CAPABILITY_NOT_ALLOWED',
    ]),
  }),
]);

export const meshExecutionTraceSchema = z.object({
  mode: z.literal('MOCK'),
  requestId: z.string().min(1),
  sessionId: z.string().min(1),
  workflowId: meshWorkflowIdSchema,
  clientId: z.literal(ZENZY_MESH_CLIENT_ID),
  phase: z.literal(ZENZY_MESH_PREVIEW_PHASE),
  appVersion: z.string().min(1),
  buildRef: z.string().min(1),
  governance: z.object({
    decision: z.literal('ALLOW'),
    policyVersion: z.literal(GOV_OS_PREVIEW_POLICY),
    authority: z.literal('PLAN_PREVIEW_ONLY'),
  }),
  route: z.object({
    routeId: z.string().min(1),
    agents: z.array(meshAgentIdSchema).min(2),
  }),
  evidence: z.object({
    evidenceId: z.string().min(1),
    createdAt: z.string().datetime(),
    provenance: z.literal('MOCK_MESH_LOCAL_ONLY'),
  }),
});

export type MeshWorkflowId = z.infer<typeof meshWorkflowIdSchema>;
export type MeshRequest = z.infer<typeof meshRequestSchema>;
export type MeshGovernanceDecision = z.infer<
  typeof meshGovernanceDecisionSchema
>;
export type MeshExecutionTrace = z.infer<typeof meshExecutionTraceSchema>;
