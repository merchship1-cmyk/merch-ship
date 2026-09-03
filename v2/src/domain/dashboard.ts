import { z } from 'zod';

import type { MeshExecutionTrace } from './mesh';

export const dashboardStageSchema = z.enum([
  'start',
  'clarity',
  'execution',
  'outcome',
]);

export const dashboardSnapshotSchema = z.object({
  stage: dashboardStageSchema,
  currentUnderstanding: z.string().min(1).max(600),
  now: z.string().min(1).max(300),
  next: z.string().min(1).max(300),
  later: z.string().min(1).max(300),
  blocked: z.string().min(1).max(300),
  done: z.string().min(1).max(300),
  updatedAt: z.string().datetime(),
});

export type DashboardStage = z.infer<typeof dashboardStageSchema>;
export type DashboardSnapshot = z.infer<typeof dashboardSnapshotSchema>;

export function createDashboardSnapshot(
  stage: DashboardStage,
  now = new Date(),
): DashboardSnapshot {
  const updatedAt = now.toISOString();

  if (stage === 'clarity') {
    return {
      stage,
      currentUnderstanding:
        'Zenzy has turned your starting input into a proposed direction. Nothing executes until you approve that direction.',
      now: 'Review the clarity screen and decide whether the direction fits.',
      next: 'Accept the direction or reject it and try again.',
      later: 'Execution opens only after an explicit acceptance.',
      blocked: 'Nothing blocked right now.',
      done: 'Your starting input was turned into a clear proposed direction.',
      updatedAt,
    };
  }

  if (stage === 'execution') {
    return {
      stage,
      currentUnderstanding:
        'You accepted the direction. Zenzy can now move from clarity into execution while keeping the decision boundary visible.',
      now: 'Work through the accepted execution steps.',
      next: 'Review the outcome and record what actually happened.',
      later: 'Use the completed result as context for the next useful move.',
      blocked: 'Nothing blocked right now.',
      done: 'The proposed direction was explicitly accepted.',
      updatedAt,
    };
  }

  if (stage === 'outcome') {
    return {
      stage,
      currentUnderstanding:
        'This piece of work is complete and its outcome evidence has been recorded.',
      now: 'Review what was completed and what the evidence says.',
      next: 'Choose the next useful piece of work when you are ready.',
      later: 'Let completed work inform the next dashboard state instead of starting from memory.',
      blocked: 'Nothing blocked right now.',
      done: 'Outcome completed and evidence recorded.',
      updatedAt,
    };
  }

  return {
    stage: 'start',
    currentUnderstanding:
      'Zenzy is ready. This home screen keeps a simple memory of where your work stands so you do not have to reconstruct the whole thread each time.',
    now: 'Tell Zenzy the one thing you are trying to get done.',
    next: 'Review the direction Zenzy gives you.',
    later: 'Execute only after the direction is clear and accepted.',
    blocked: 'Nothing blocked right now.',
    done: 'No completed work recorded in this dashboard yet.',
    updatedAt,
  };
}

export function attachMeshTraceToDashboard(
  snapshot: DashboardSnapshot,
  trace: MeshExecutionTrace,
): DashboardSnapshot {
  const routeSummary =
    ` Governed MOCK mesh route ${trace.workflowId} was authorized as ` +
    `${trace.governance.authority}; no live agent, tool, publish, payment, or destructive action ran.`;

  return dashboardSnapshotSchema.parse({
    ...snapshot,
    currentUnderstanding: (snapshot.currentUnderstanding + routeSummary).slice(
      0,
      600,
    ),
    done: (
      `Mesh evidence ${trace.evidence.evidenceId} retained. ` +
      `GOV-OS preview decision: ${trace.governance.decision}.`
    ).slice(0, 300),
  });
}

export function markDashboardBlocked(
  snapshot: DashboardSnapshot,
  message: string,
  now = new Date(),
): DashboardSnapshot {
  const normalized = message.trim() || 'Zenzy could not continue this step.';

  return {
    ...snapshot,
    currentUnderstanding:
      'Zenzy hit a blocker before this step could finish. The blocker is recorded here so you do not have to remember it.',
    blocked: normalized.slice(0, 300),
    updatedAt: now.toISOString(),
  };
}
