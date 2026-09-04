import {
  AUTONOMOUS_OS_RUNTIME_CEILING,
  AUTONOMOUS_OS_VERSION,
  type AutonomousCapability,
  type AutonomousMission,
  type AutonomousMissionDraft,
  type AutonomousMissionEvent,
  type AutonomousMissionEvidence,
  type AutonomousMissionPlanStep,
  autonomousMissionDraftSchema,
  autonomousMissionSchema,
  capabilityFitsAutonomyLevel,
  isAutonomyLevelAdmitted,
} from '../domain/autonomousMission';

export type MissionAuthorizationDenialCode =
  | 'MISSION_NOT_CREATED'
  | 'AUTHORITY_EXPIRED'
  | 'AUTONOMY_LEVEL_NOT_ADMITTED'
  | 'CAPABILITY_EXCEEDS_LEVEL';

export type MissionAuthorizationDecision =
  | {
      decision: 'ALLOW';
      runtimeCeiling: typeof AUTONOMOUS_OS_RUNTIME_CEILING;
    }
  | {
      decision: 'DENY';
      reasonCode: MissionAuthorizationDenialCode;
      message: string;
      runtimeCeiling: typeof AUTONOMOUS_OS_RUNTIME_CEILING;
    };

export type MissionExecutionDecision = {
  decision: 'DENY';
  reasonCode: 'MISSION_NOT_PLANNED' | 'RUNTIME_EXECUTION_NOT_ADMITTED';
  message: string;
  runtimeCeiling: typeof AUTONOMOUS_OS_RUNTIME_CEILING;
};

function iso(now: Date): string {
  return now.toISOString();
}

function appendEvent(
  mission: AutonomousMission,
  type: AutonomousMissionEvent['type'],
  summary: string,
  now: Date,
): AutonomousMission {
  const event: AutonomousMissionEvent = {
    eventId: `${mission.missionId}:${mission.events.length + 1}`,
    type,
    at: iso(now),
    summary,
  };

  return autonomousMissionSchema.parse({
    ...mission,
    events: [...mission.events, event],
    updatedAt: iso(now),
  });
}

function isExpired(expiresAt: string | undefined, now: Date): boolean {
  return expiresAt !== undefined && Date.parse(expiresAt) <= now.getTime();
}

function requireMutableMission(mission: AutonomousMission): void {
  if (mission.state === 'COMPLETED' || mission.state === 'FAILED') {
    throw new Error(`Mission ${mission.missionId} is terminal: ${mission.state}.`);
  }
}

export function createAutonomousMission(
  input: AutonomousMissionDraft,
  now = new Date(),
): AutonomousMission {
  const draft = autonomousMissionDraftSchema.parse(input);
  const createdAt = iso(now);

  return autonomousMissionSchema.parse({
    ...draft,
    schemaVersion: AUTONOMOUS_OS_VERSION,
    state: 'CREATED',
    authorization: null,
    plan: [],
    evidence: [],
    events: [
      {
        eventId: `${draft.missionId}:1`,
        type: 'CREATED',
        at: createdAt,
        summary:
          'Mission created as a request only. Creation does not grant execution authority.',
      },
    ],
    createdAt,
    updatedAt: createdAt,
  });
}

export function evaluateMissionAuthorization(
  missionInput: AutonomousMission,
  now = new Date(),
): MissionAuthorizationDecision {
  const mission = autonomousMissionSchema.parse(missionInput);

  if (mission.state !== 'CREATED') {
    return {
      decision: 'DENY',
      reasonCode: 'MISSION_NOT_CREATED',
      message: 'Only CREATED missions can enter the authorization gate.',
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
    };
  }

  if (isExpired(mission.authorityRequest.expiresAt, now)) {
    return {
      decision: 'DENY',
      reasonCode: 'AUTHORITY_EXPIRED',
      message: 'The requested authority envelope has expired.',
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
    };
  }

  if (!isAutonomyLevelAdmitted(mission.autonomyLevel)) {
    return {
      decision: 'DENY',
      reasonCode: 'AUTONOMY_LEVEL_NOT_ADMITTED',
      message:
        `AUTONOMOUS-OS v1 is runtime-capped at ${AUTONOMOUS_OS_RUNTIME_CEILING}; ` +
        `${mission.autonomyLevel} remains architecture-defined but not runtime-admitted.`,
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
    };
  }

  const capabilityBeyondLevel = mission.authorityRequest.allowedCapabilities.find(
    (capability) =>
      !capabilityFitsAutonomyLevel(capability, mission.autonomyLevel),
  );

  if (capabilityBeyondLevel !== undefined) {
    return {
      decision: 'DENY',
      reasonCode: 'CAPABILITY_EXCEEDS_LEVEL',
      message:
        `${capabilityBeyondLevel} exceeds the requested autonomy level ` +
        `${mission.autonomyLevel}.`,
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
    };
  }

  return {
    decision: 'ALLOW',
    runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
  };
}

export function authorizeMission(
  missionInput: AutonomousMission,
  grantedBy: string,
  now = new Date(),
): {
  mission: AutonomousMission;
  decision: MissionAuthorizationDecision;
} {
  const mission = autonomousMissionSchema.parse(missionInput);
  const decision = evaluateMissionAuthorization(mission, now);

  if (decision.decision === 'DENY') {
    return {
      decision,
      mission: appendEvent(
        mission,
        'AUTHORIZATION_DENIED',
        `${decision.reasonCode}: ${decision.message}`,
        now,
      ),
    };
  }

  const authorized = autonomousMissionSchema.parse({
    ...mission,
    state: 'AUTHORIZED',
    authorization: {
      grantedBy,
      policyVersion: mission.authorityRequest.policyVersion,
      grantedCapabilities: mission.authorityRequest.allowedCapabilities,
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
      grantedAt: iso(now),
      ...(mission.authorityRequest.expiresAt === undefined
        ? {}
        : { expiresAt: mission.authorityRequest.expiresAt }),
    },
    updatedAt: iso(now),
  });

  return {
    decision,
    mission: appendEvent(
      authorized,
      'AUTHORIZATION_ALLOWED',
      `Authorized under ${authorized.authorityRequest.policyVersion} with runtime ceiling ${AUTONOMOUS_OS_RUNTIME_CEILING}.`,
      now,
    ),
  };
}

function assertPlanCapabilityAuthorized(
  capability: AutonomousCapability,
  mission: AutonomousMission,
): void {
  if (mission.authorization === null) {
    throw new Error('Mission has no authorization record.');
  }

  if (!mission.authorization.grantedCapabilities.includes(capability)) {
    throw new Error(`Plan capability is not authorized: ${capability}.`);
  }
}

export function planMission(
  missionInput: AutonomousMission,
  steps: AutonomousMissionPlanStep[],
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);

  if (mission.state !== 'AUTHORIZED') {
    throw new Error('Mission must be AUTHORIZED before it can be PLANNED.');
  }

  if (steps.length === 0) {
    throw new Error('Mission plan must contain at least one step.');
  }

  const requirementIds = new Set(
    mission.evidenceRequirements.map((requirement) => requirement.requirementId),
  );

  for (const step of steps) {
    assertPlanCapabilityAuthorized(step.capability, mission);

    for (const requirementId of step.evidenceRequirementIds) {
      if (!requirementIds.has(requirementId)) {
        throw new Error(
          `Plan references unknown evidence requirement: ${requirementId}.`,
        );
      }
    }
  }

  const planned = autonomousMissionSchema.parse({
    ...mission,
    state: 'PLANNED',
    plan: steps,
    updatedAt: iso(now),
  });

  return appendEvent(
    planned,
    'PLANNED',
    `Prepared ${steps.length} bounded mission step(s). No live execution was started.`,
    now,
  );
}

export function evaluateMissionExecutionStart(
  missionInput: AutonomousMission,
): MissionExecutionDecision {
  const mission = autonomousMissionSchema.parse(missionInput);

  if (mission.state !== 'PLANNED') {
    return {
      decision: 'DENY',
      reasonCode: 'MISSION_NOT_PLANNED',
      message: 'Execution cannot be considered before the mission is PLANNED.',
      runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
    };
  }

  return {
    decision: 'DENY',
    reasonCode: 'RUNTIME_EXECUTION_NOT_ADMITTED',
    message:
      `AUTONOMOUS-OS v1 is capped at ${AUTONOMOUS_OS_RUNTIME_CEILING}. ` +
      'A3 bounded execution requires a separate governed admission and evidence gate.',
    runtimeCeiling: AUTONOMOUS_OS_RUNTIME_CEILING,
  };
}

export function recordMissionEvidence(
  missionInput: AutonomousMission,
  evidenceInput: AutonomousMissionEvidence,
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);
  requireMutableMission(mission);

  if (
    !mission.evidenceRequirements.some(
      (requirement) => requirement.requirementId === evidenceInput.requirementId,
    )
  ) {
    throw new Error(
      `Evidence references unknown requirement: ${evidenceInput.requirementId}.`,
    );
  }

  if (mission.evidence.some((item) => item.evidenceId === evidenceInput.evidenceId)) {
    throw new Error(`Duplicate evidence id: ${evidenceInput.evidenceId}.`);
  }

  const updated = autonomousMissionSchema.parse({
    ...mission,
    evidence: [...mission.evidence, evidenceInput],
    updatedAt: iso(now),
  });

  return appendEvent(
    updated,
    'EVIDENCE_RECORDED',
    `Evidence ${evidenceInput.evidenceId} recorded for ${evidenceInput.requirementId}.`,
    now,
  );
}

export function blockMission(
  missionInput: AutonomousMission,
  reason: string,
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);
  requireMutableMission(mission);

  const blocked = autonomousMissionSchema.parse({
    ...mission,
    state: 'BLOCKED',
    updatedAt: iso(now),
  });

  return appendEvent(blocked, 'BLOCKED', reason, now);
}

export function escalateMission(
  missionInput: AutonomousMission,
  reason: string,
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);
  requireMutableMission(mission);

  const escalated = autonomousMissionSchema.parse({
    ...mission,
    state: 'ESCALATED',
    updatedAt: iso(now),
  });

  return appendEvent(escalated, 'ESCALATED', reason, now);
}

export function failMission(
  missionInput: AutonomousMission,
  reason: string,
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);
  requireMutableMission(mission);

  const failed = autonomousMissionSchema.parse({
    ...mission,
    state: 'FAILED',
    updatedAt: iso(now),
  });

  return appendEvent(failed, 'FAILED', reason, now);
}

export function completeMission(
  missionInput: AutonomousMission,
  summary: string,
  now = new Date(),
): AutonomousMission {
  const mission = autonomousMissionSchema.parse(missionInput);

  if (mission.state !== 'PLANNED') {
    throw new Error('Only a PLANNED A0-A2 mission can complete in AUTONOMOUS-OS v1.');
  }

  const evidencedRequirementIds = new Set(
    mission.evidence.map((evidence) => evidence.requirementId),
  );
  const missingRequirement = mission.evidenceRequirements.find(
    (requirement) =>
      requirement.requiredBeforeCompletion &&
      !evidencedRequirementIds.has(requirement.requirementId),
  );

  if (missingRequirement !== undefined) {
    throw new Error(
      `Cannot complete without required evidence: ${missingRequirement.requirementId}.`,
    );
  }

  const completed = autonomousMissionSchema.parse({
    ...mission,
    state: 'COMPLETED',
    updatedAt: iso(now),
  });

  return appendEvent(completed, 'COMPLETED', summary, now);
}
