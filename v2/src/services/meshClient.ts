import {
  GOV_OS_PREVIEW_POLICY,
  ZENZY_MESH_CLIENT_ID,
  ZENZY_MESH_PREVIEW_PHASE,
  meshExecutionTraceSchema,
  meshRequestSchema,
  type MeshGovernanceDecision,
  type MeshRequest,
  type MeshWorkflowId,
} from '../domain/mesh';
import {
  transformationResultSchema,
  type TransformationResult,
} from '../domain/transformation';
import { createMockTransformation } from './mockTransformation';

const allowedWorkflows = new Set<MeshWorkflowId>([
  'PFU_WEEKLY_PLAN_V0_1',
  'ZENZY_TRANSFORMATION_V0_1',
]);

function isPfuWeeklyPlan(goal: string) {
  return /\bpfu\b/i.test(goal) && /\bweek(?:ly)?\b/i.test(goal);
}

function resolveWorkflow(goal: string): MeshWorkflowId {
  return isPfuWeeklyPlan(goal)
    ? 'PFU_WEEKLY_PLAN_V0_1'
    : 'ZENZY_TRANSFORMATION_V0_1';
}

export function createMockMeshRequest(
  goal: string,
  now = new Date(),
): MeshRequest {
  const workflowId = resolveWorkflow(goal);
  const stamp = now.getTime();

  return meshRequestSchema.parse({
    requestId: `mesh-req-${stamp}`,
    client: {
      clientId: ZENZY_MESH_CLIENT_ID,
      phase: ZENZY_MESH_PREVIEW_PHASE,
      appVersion: '0.1.0',
      buildRef: process.env.EXPO_PUBLIC_ZENZY_BUILD_SHA ?? 'PR34_PREVIEW',
    },
    actor: {
      userId: 'local-preview',
      roles: ['FOUNDER_PREVIEW'],
    },
    session: {
      sessionId: `mesh-session-${stamp}`,
      workflowId,
    },
    intent: {
      type: workflowId === 'PFU_WEEKLY_PLAN_V0_1' ? 'PLAN_WEEK' : 'TRANSFORM_WORK',
      goal,
    },
    constraints: {
      mode: 'PREVIEW',
      destructiveActions: false,
      externalPublish: false,
      financialExecution: false,
      liveToolExecution: false,
    },
  });
}

export function evaluateMockGovernance(
  request: MeshRequest,
): MeshGovernanceDecision {
  if (request.client.clientId !== ZENZY_MESH_CLIENT_ID) {
    return {
      decision: 'DENY',
      policyVersion: GOV_OS_PREVIEW_POLICY,
      reasonCode: 'CLIENT_NOT_REGISTERED',
    };
  }

  if (request.client.phase !== ZENZY_MESH_PREVIEW_PHASE) {
    return {
      decision: 'DENY',
      policyVersion: GOV_OS_PREVIEW_POLICY,
      reasonCode: 'PHASE_NOT_ALLOWED',
    };
  }

  if (!allowedWorkflows.has(request.session.workflowId)) {
    return {
      decision: 'DENY',
      policyVersion: GOV_OS_PREVIEW_POLICY,
      reasonCode: 'WORKFLOW_NOT_ALLOWED',
    };
  }

  if (
    request.constraints.destructiveActions ||
    request.constraints.externalPublish ||
    request.constraints.financialExecution ||
    request.constraints.liveToolExecution
  ) {
    return {
      decision: 'DENY',
      policyVersion: GOV_OS_PREVIEW_POLICY,
      reasonCode: 'CAPABILITY_NOT_ALLOWED',
    };
  }

  return {
    decision: 'ALLOW',
    policyVersion: GOV_OS_PREVIEW_POLICY,
    authority: 'PLAN_PREVIEW_ONLY',
  };
}

function createPfuWeeklyPlan(
  sourceInput: string,
  now: Date,
): TransformationResult {
  const base = createMockTransformation(sourceInput, now);

  return {
    ...base,
    objective:
      'Build a governed seven-day PFU operating plan without publishing, spending, destructive actions, or live tool execution.',
    idea: {
      signal: 'PFU weekly planning request',
      finishLine:
        'A seven-day preview plan exists with priorities, review points, and explicit authority boundaries.',
    },
    plan: [
      {
        id: 'pfu-gates',
        title: 'Review active PFU gates',
        action:
          'List only the PFU work that is already defined or awaiting validation; do not infer new authority.',
        definitionOfDone:
          'The week starts from known work and clearly marks anything still unvalidated.',
      },
      {
        id: 'pfu-priority',
        title: 'Choose the weekly focus',
        action:
          'Select the smallest set of validated priorities that can materially move PFU forward this week.',
        definitionOfDone:
          'Each selected priority has a concrete outcome and no hidden expansion dependency.',
      },
      {
        id: 'pfu-schedule',
        title: 'Place work into the week',
        action:
          'Assign focused work blocks and evidence checks while keeping blocked or unauthorized work out of execution.',
        definitionOfDone:
          'Every scheduled item is either executable in preview or explicitly marked blocked.',
      },
      {
        id: 'pfu-review',
        title: 'Close with evidence',
        action:
          'Review completed work, retained evidence, blockers, and the next milestone requiring authorization.',
        definitionOfDone:
          'The weekly review separates completed evidence from assumptions and future authority.',
      },
    ],
    createdOutput: {
      title: 'PFU Weekly Plan — governed preview',
      body:
        'NOW: Review active PFU gates and choose the smallest validated weekly focus.\n\nNEXT: Schedule only preview-safe work and retain evidence as each item closes.\n\nLATER: Surface blocked expansion separately for review rather than executing it implicitly.\n\nBOUNDARY: This is a MOCK mesh result. No live PFU agent, external tool, publishing, payment, or destructive action ran.',
    },
    schedule: [
      {
        label: 'Start of week',
        action: 'Review gates and choose the validated PFU focus.',
        durationMinutes: 30,
      },
      {
        label: 'Midweek',
        action: 'Check progress, evidence, and blockers without expanding scope.',
        durationMinutes: 20,
      },
      {
        label: 'End of week',
        action: 'Record outcomes and identify the next milestone needing review.',
        durationMinutes: 30,
      },
    ],
    review: {
      prompt:
        'Did this weekly plan advance validated PFU work without crossing its preview authority boundary?',
      successCriteria: [
        'Scheduled work stayed inside the preview boundary.',
        'Blocked work was surfaced rather than silently executed.',
        'Completed work has evidence that can be reviewed.',
      ],
    },
  };
}

export async function executeMockMeshTransformation(
  goal: string,
  now = new Date(),
): Promise<TransformationResult> {
  const request = createMockMeshRequest(goal, now);
  const governance = evaluateMockGovernance(request);

  if (governance.decision === 'DENY') {
    throw new Error(`GOV-OS preview denied this request: ${governance.reasonCode}.`);
  }

  const stamp = now.getTime();
  const agents =
    request.session.workflowId === 'PFU_WEEKLY_PLAN_V0_1'
      ? (['GOVERNANCE_AGENT', 'PFU_AGENT'] as const)
      : (['GOVERNANCE_AGENT', 'ZENZY_TRANSFORMATION_AGENT'] as const);

  const trace = meshExecutionTraceSchema.parse({
    mode: 'MOCK',
    requestId: request.requestId,
    sessionId: request.session.sessionId,
    workflowId: request.session.workflowId,
    clientId: ZENZY_MESH_CLIENT_ID,
    phase: ZENZY_MESH_PREVIEW_PHASE,
    appVersion: request.client.appVersion,
    buildRef: request.client.buildRef,
    governance,
    route: {
      routeId: `mesh-route-${stamp}`,
      agents,
    },
    evidence: {
      evidenceId: `mesh-evidence-${stamp}`,
      createdAt: now.toISOString(),
      provenance: 'MOCK_MESH_LOCAL_ONLY',
    },
  });

  const result =
    request.session.workflowId === 'PFU_WEEKLY_PLAN_V0_1'
      ? createPfuWeeklyPlan(goal, now)
      : createMockTransformation(goal, now);

  return transformationResultSchema.parse({
    ...result,
    mesh: trace,
  });
}
