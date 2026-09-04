import {
  MONEY_CHAIN_ORDER,
  type MoneyChainState,
  type UcaMaturity,
} from '../domain/unifiedCommercialArchitecture';

export type ProtectedCommercialAction =
  | 'PUBLIC_PUBLISH'
  | 'PRICE_CHANGE'
  | 'LEGAL_TERMS_CHANGE'
  | 'CUSTOMER_FINANCIAL_EXECUTION'
  | 'PRODUCTION_DEPLOYMENT'
  | 'PRODUCTION_DATA_MUTATION'
  | 'AUTHORITY_EXPANSION';

export type ProtectedActionDecision = {
  decision: 'DENY';
  reasonCode: 'A3_EXECUTION_NOT_ADMITTED';
  action: ProtectedCommercialAction;
};

export function evaluateProtectedCommercialAction(
  action: ProtectedCommercialAction,
): ProtectedActionDecision {
  return {
    decision: 'DENY',
    reasonCode: 'A3_EXECUTION_NOT_ADMITTED',
    action,
  };
}

const MATURITY_ORDER: readonly UcaMaturity[] = [
  'DEFINED',
  'CODE_CONTRACTED',
  'TESTED',
  'VERIFIED',
  'CONNECTED',
  'PRODUCTION_AUTHORIZED',
] as const;

export type LifecycleAdvanceRequest = {
  current: UcaMaturity;
  target: UcaMaturity;
  evidenceIds: string[];
  govOsAuthorization?: boolean;
};

export type LifecycleAdvanceDecision =
  | { decision: 'ALLOW_PREPARATION'; target: UcaMaturity }
  | {
      decision: 'DENY';
      reasonCode:
        | 'NO_STATE_SKIP'
        | 'EVIDENCE_REQUIRED'
        | 'GOV_OS_AUTHORIZATION_REQUIRED';
    };

export function evaluateLifecycleAdvance(
  request: LifecycleAdvanceRequest,
): LifecycleAdvanceDecision {
  const currentIndex = MATURITY_ORDER.indexOf(request.current);
  const targetIndex = MATURITY_ORDER.indexOf(request.target);

  if (targetIndex !== currentIndex + 1) {
    return { decision: 'DENY', reasonCode: 'NO_STATE_SKIP' };
  }

  if (
    ['TESTED', 'VERIFIED', 'CONNECTED', 'PRODUCTION_AUTHORIZED'].includes(
      request.target,
    ) &&
    request.evidenceIds.length === 0
  ) {
    return { decision: 'DENY', reasonCode: 'EVIDENCE_REQUIRED' };
  }

  if (
    request.target === 'PRODUCTION_AUTHORIZED' &&
    request.govOsAuthorization !== true
  ) {
    return {
      decision: 'DENY',
      reasonCode: 'GOV_OS_AUTHORIZATION_REQUIRED',
    };
  }

  return { decision: 'ALLOW_PREPARATION', target: request.target };
}

export type OverseerSignalInput = {
  driftDetected?: boolean;
  loopDetected?: boolean;
  recursionDetected?: boolean;
  evidenceGapDetected?: boolean;
};

export type OverseerSignalDecision = {
  recommendation: 'CONTINUE' | 'FREEZE_AND_ESCALATE';
  canAuthorizeProtectedAction: false;
  canDeclareEvidenceVerified: false;
  signals: Array<'DRIFT' | 'LOOP' | 'RECURSION' | 'EVIDENCE_GAP'>;
};

export function evaluateOverseerSignals(
  input: OverseerSignalInput,
): OverseerSignalDecision {
  const signals: OverseerSignalDecision['signals'] = [];

  if (input.driftDetected === true) signals.push('DRIFT');
  if (input.loopDetected === true) signals.push('LOOP');
  if (input.recursionDetected === true) signals.push('RECURSION');
  if (input.evidenceGapDetected === true) signals.push('EVIDENCE_GAP');

  return {
    recommendation:
      signals.length > 0 ? 'FREEZE_AND_ESCALATE' : 'CONTINUE',
    canAuthorizeProtectedAction: false,
    canDeclareEvidenceVerified: false,
    signals,
  };
}

export type MoneyChainAdvanceRequest = {
  current: MoneyChainState;
  target: MoneyChainState;
  evidenceIds: string[];
};

export type MoneyChainAdvanceDecision =
  | { decision: 'ALLOW_RECORD_PREPARATION'; target: MoneyChainState }
  | {
      decision: 'DENY';
      reasonCode: 'NO_STATE_SKIP' | 'EVIDENCE_REQUIRED';
    };

export function evaluateMoneyChainAdvance(
  request: MoneyChainAdvanceRequest,
): MoneyChainAdvanceDecision {
  const currentIndex = MONEY_CHAIN_ORDER.indexOf(request.current);
  const targetIndex = MONEY_CHAIN_ORDER.indexOf(request.target);

  if (targetIndex !== currentIndex + 1) {
    return { decision: 'DENY', reasonCode: 'NO_STATE_SKIP' };
  }

  if (
    [
      'TRANSACTION_VERIFIED',
      'COMMISSION_ELIGIBLE',
      'COMMISSION_APPROVED',
      'PAYOUT_RECORDED',
      'RECONCILED',
    ].includes(request.target) &&
    request.evidenceIds.length === 0
  ) {
    return { decision: 'DENY', reasonCode: 'EVIDENCE_REQUIRED' };
  }

  return { decision: 'ALLOW_RECORD_PREPARATION', target: request.target };
}
