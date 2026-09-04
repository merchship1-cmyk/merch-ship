import { describe, expect, it } from 'vitest';
import {
  UCA_COMPONENT_REGISTRY,
  getUcaComponent,
} from '../domain/unifiedCommercialArchitecture';
import {
  evaluateLifecycleAdvance,
  evaluateMoneyChainAdvance,
  evaluateOverseerSignals,
  evaluateProtectedCommercialAction,
} from './ucaGovernance';

describe('Unified Commercial Architecture v1', () => {
  it('classifies four-verb constructs as protocols rather than authority-bearing engines', () => {
    const protocolIds = UCA_COMPONENT_REGISTRY.filter(
      (component) => component.kind === 'PROTOCOL',
    ).map((component) => component.id);

    expect(protocolIds).toEqual([
      'DEFINE_AUTHORIZE_EXECUTE_EVIDENCE',
      'DETECT_FREEZE_CORRECT_RESUME',
      'GENERATE_PACKAGE_PRICE_PUBLISH',
      'ROUTE_EXECUTE_VALIDATE_RECORD',
      'OBSERVE_CORRELATE_EVALUATE_DECIDE',
    ]);
  });

  it('keeps new engine identities code-contracted but not runtime verified', () => {
    for (const id of ['GCOSE', 'IIS', 'OVERSEER', 'DCR_EVO_UNI'] as const) {
      const component = getUcaComponent(id);
      expect(component.kind).toBe('ENGINE_CANDIDATE');
      expect(component.maturity).toBe('CODE_CONTRACTED');
      expect(component.runtimeCeiling).toBe('A2');
    }
  });

  it('denies every protected commercial action at the current A2 ceiling', () => {
    expect(evaluateProtectedCommercialAction('PUBLIC_PUBLISH')).toEqual({
      decision: 'DENY',
      reasonCode: 'A3_EXECUTION_NOT_ADMITTED',
      action: 'PUBLIC_PUBLISH',
    });

    expect(evaluateProtectedCommercialAction('PRODUCTION_DEPLOYMENT')).toEqual({
      decision: 'DENY',
      reasonCode: 'A3_EXECUTION_NOT_ADMITTED',
      action: 'PRODUCTION_DEPLOYMENT',
    });
  });

  it('prevents lifecycle state skipping and evidence-free verification', () => {
    expect(
      evaluateLifecycleAdvance({
        current: 'CODE_CONTRACTED',
        target: 'VERIFIED',
        evidenceIds: ['evidence-1'],
      }),
    ).toEqual({ decision: 'DENY', reasonCode: 'NO_STATE_SKIP' });

    expect(
      evaluateLifecycleAdvance({
        current: 'CODE_CONTRACTED',
        target: 'TESTED',
        evidenceIds: [],
      }),
    ).toEqual({ decision: 'DENY', reasonCode: 'EVIDENCE_REQUIRED' });
  });

  it('requires an explicit GOV-OS decision before production authorization', () => {
    expect(
      evaluateLifecycleAdvance({
        current: 'CONNECTED',
        target: 'PRODUCTION_AUTHORIZED',
        evidenceIds: ['runtime-proof-1'],
      }),
    ).toEqual({
      decision: 'DENY',
      reasonCode: 'GOV_OS_AUTHORIZATION_REQUIRED',
    });
  });

  it('keeps Overseer supervisory and fail-closed on instability signals', () => {
    expect(
      evaluateOverseerSignals({
        driftDetected: true,
        evidenceGapDetected: true,
      }),
    ).toEqual({
      recommendation: 'FREEZE_AND_ESCALATE',
      canAuthorizeProtectedAction: false,
      canDeclareEvidenceVerified: false,
      signals: ['DRIFT', 'EVIDENCE_GAP'],
    });
  });

  it('does not allow money-chain promotion to verified sale, commission, or payout without evidence', () => {
    expect(
      evaluateMoneyChainAdvance({
        current: 'TRANSACTION_OBSERVED',
        target: 'TRANSACTION_VERIFIED',
        evidenceIds: [],
      }),
    ).toEqual({ decision: 'DENY', reasonCode: 'EVIDENCE_REQUIRED' });

    expect(
      evaluateMoneyChainAdvance({
        current: 'COMMISSION_APPROVED',
        target: 'PAYOUT_RECORDED',
        evidenceIds: [],
      }),
    ).toEqual({ decision: 'DENY', reasonCode: 'EVIDENCE_REQUIRED' });
  });
});
