import { describe, expect, it } from 'vitest';

import { transformationResultSchema } from '../domain/transformation';
import {
  createMockMeshRequest,
  evaluateMockGovernance,
  executeMockMeshTransformation,
} from './meshClient';

describe('governed mock mesh', () => {
  it('routes a PFU weekly plan through the governed PFU preview lane', async () => {
    const now = new Date('2026-09-03T10:00:00.000Z');
    const result = await executeMockMeshTransformation(
      'Plan my PFU week',
      now,
    );

    expect(transformationResultSchema.parse(result)).toEqual(result);
    expect(result.mesh?.workflowId).toBe('PFU_WEEKLY_PLAN_V0_1');
    expect(result.mesh?.governance).toEqual({
      decision: 'ALLOW',
      policyVersion: 'GOV_OS_PREVIEW_0_1',
      authority: 'PLAN_PREVIEW_ONLY',
    });
    expect(result.mesh?.route.agents).toEqual([
      'GOVERNANCE_AGENT',
      'PFU_AGENT',
    ]);
    expect(result.createdOutput.title).toBe('PFU Weekly Plan — governed preview');
    expect(result.createdOutput.body).toContain('MOCK mesh result');
  });

  it('keeps ordinary Zenzy work on the generic governed transformation lane', async () => {
    const result = await executeMockMeshTransformation(
      'Plan my MERCH SHIP launch',
      new Date('2026-09-03T10:01:00.000Z'),
    );

    expect(result.mesh?.workflowId).toBe('ZENZY_TRANSFORMATION_V0_1');
    expect(result.mesh?.route.agents).toEqual([
      'GOVERNANCE_AGENT',
      'ZENZY_TRANSFORMATION_AGENT',
    ]);
  });

  it('denies capabilities that exceed the Phase 1B preview boundary', () => {
    const request = createMockMeshRequest(
      'Plan my PFU week',
      new Date('2026-09-03T10:02:00.000Z'),
    );

    const decision = evaluateMockGovernance({
      ...request,
      constraints: {
        ...request.constraints,
        destructiveActions: true,
      },
    });

    expect(decision).toEqual({
      decision: 'DENY',
      policyVersion: 'GOV_OS_PREVIEW_0_1',
      reasonCode: 'CAPABILITY_NOT_ALLOWED',
    });
  });
});
