import { describe, expect, it } from 'vitest';
import {
  AUTONOMOUS_OS_LAWS,
  autonomousMissionDraftSchema,
  type AutonomousMissionDraft,
} from '../domain/autonomousMission';
import {
  authorizeMission,
  completeMission,
  createAutonomousMission,
  evaluateMissionExecutionStart,
  planMission,
  recordMissionEvidence,
} from './autonomousMissionEngine';

const NOW = new Date('2026-09-03T23:40:00.000Z');

function createDraft(
  overrides: Partial<AutonomousMissionDraft> = {},
): AutonomousMissionDraft {
  const draft: AutonomousMissionDraft = {
    missionId: '123e4567-e89b-42d3-a456-426614174000',
    objective: 'Prepare an evidence-ready inventory reconciliation.',
    desiredState: 'Usable deliverables separated from draft-only records.',
    target: {
      system: 'MERCHSHIP',
      objectType: 'INVENTORY_RECONCILIATION',
      objectId: 'BRI-11',
    },
    autonomyLevel: 'A2',
    authorityRequest: {
      authoritySource: 'GOV-OS / Founder bounded authorization',
      policyVersion: 'AUTONOMOUS_OS_POLICY_1_0',
      environment: 'STAGING',
      allowedCapabilities: [
        'OBSERVE',
        'RECOMMEND',
        'PREPARE',
        'EVIDENCE_WRITE',
        'ESCALATE',
      ],
      prohibitedActions: [
        ...AUTONOMOUS_OS_LAWS,
        'PUBLIC_PUBLISH',
        'PRICE_CHANGE',
        'LEGAL_TERMS_CHANGE',
        'PRODUCTION_DEPLOY',
        'CUSTOMER_FINANCIAL_EXECUTION',
        'UNBOUNDED_EXTERNAL_WRITE',
      ],
    },
    constraints: {
      riskCeiling: 'LOW',
      maxAttempts: 3,
      maxSpendCad: 0,
    },
    evidenceRequirements: [
      {
        requirementId: 'inventory-map',
        description: 'Retain the inventory-to-deliverable mapping evidence.',
        requiredBeforeCompletion: true,
      },
    ],
    stopConditions: [
      {
        conditionId: 'sellability-promotion',
        description: 'Stop if any draft item would be promoted to publicly sellable.',
        action: 'STOP',
      },
    ],
    completionDefinition:
      'A reconciliation is prepared with evidence and no public-sale promotion.',
  };

  return {
    ...draft,
    ...overrides,
  };
}

describe('AUTONOMOUS-OS mission kernel v1', () => {
  it('creates a mission request without inventing authority', () => {
    const mission = createAutonomousMission(createDraft(), NOW);

    expect(mission.state).toBe('CREATED');
    expect(mission.authorization).toBeNull();
    expect(mission.events[0]?.summary).toContain('does not grant execution authority');
  });

  it('rejects production as a mission environment', () => {
    const input = {
      ...createDraft(),
      authorityRequest: {
        ...createDraft().authorityRequest,
        environment: 'PRODUCTION',
      },
    };

    expect(autonomousMissionDraftSchema.safeParse(input).success).toBe(false);
  });

  it('requires every permanent autonomous guardrail', () => {
    const input = {
      ...createDraft(),
      authorityRequest: {
        ...createDraft().authorityRequest,
        prohibitedActions: AUTONOMOUS_OS_LAWS.slice(1),
      },
    };

    expect(autonomousMissionDraftSchema.safeParse(input).success).toBe(false);
  });

  it('keeps A3-A5 architecture-defined but runtime-denied', () => {
    const mission = createAutonomousMission(
      createDraft({
        autonomyLevel: 'A3',
        authorityRequest: {
          ...createDraft().authorityRequest,
          allowedCapabilities: ['EXECUTE_BOUNDED'],
        },
      }),
      NOW,
    );

    const result = authorizeMission(mission, 'Founder', NOW);

    expect(result.decision).toMatchObject({
      decision: 'DENY',
      reasonCode: 'AUTONOMY_LEVEL_NOT_ADMITTED',
      runtimeCeiling: 'A2',
    });
    expect(result.mission.state).toBe('CREATED');
    expect(result.mission.authorization).toBeNull();
  });

  it('authorizes and plans an A2 mission but still refuses live execution', () => {
    const created = createAutonomousMission(createDraft(), NOW);
    const authorized = authorizeMission(created, 'Founder', NOW);

    expect(authorized.decision.decision).toBe('ALLOW');
    expect(authorized.mission.state).toBe('AUTHORIZED');

    const planned = planMission(
      authorized.mission,
      [
        {
          stepId: 'map-inventory',
          capability: 'PREPARE',
          description: 'Prepare the inventory-to-file reconciliation map.',
          evidenceRequirementIds: ['inventory-map'],
        },
      ],
      NOW,
    );

    expect(planned.state).toBe('PLANNED');
    expect(evaluateMissionExecutionStart(planned)).toMatchObject({
      decision: 'DENY',
      reasonCode: 'RUNTIME_EXECUTION_NOT_ADMITTED',
      runtimeCeiling: 'A2',
    });
  });

  it('refuses completion until required evidence is retained', () => {
    const created = createAutonomousMission(createDraft(), NOW);
    const authorized = authorizeMission(created, 'Founder', NOW);
    const planned = planMission(
      authorized.mission,
      [
        {
          stepId: 'map-inventory',
          capability: 'PREPARE',
          description: 'Prepare the inventory-to-file reconciliation map.',
          evidenceRequirementIds: ['inventory-map'],
        },
      ],
      NOW,
    );

    expect(() => completeMission(planned, 'Done', NOW)).toThrow(
      'Cannot complete without required evidence: inventory-map.',
    );

    const evidenced = recordMissionEvidence(
      planned,
      {
        evidenceId: 'evidence-001',
        requirementId: 'inventory-map',
        summary: 'Inventory mapping evidence retained.',
        provenance: 'repository/test-fixture',
        createdAt: NOW.toISOString(),
      },
      NOW,
    );
    const completed = completeMission(
      evidenced,
      'A2 preparation mission completed with retained evidence.',
      NOW,
    );

    expect(completed.state).toBe('COMPLETED');
    expect(completed.events.at(-1)?.type).toBe('COMPLETED');
  });
});
