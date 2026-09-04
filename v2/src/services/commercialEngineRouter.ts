import {
  QTCE,
  getCommercialEngine,
  type CommercialEngineCapability,
  type CommercialEngineId,
} from '../domain/commercialEngines';

export type CommercialRouteRequest = {
  requestedCapabilities: CommercialEngineCapability[];
  includeScenarioExploration?: boolean;
  includeRealizationPlanning?: boolean;
};

export type CommercialRoutePlan = {
  runtimeCeiling: 'A2';
  route: CommercialEngineId[];
  qtceMembersUsed: CommercialEngineId[];
  notes: string[];
  executionDecision: {
    decision: 'DENY';
    reasonCode: 'A3_EXECUTION_NOT_ADMITTED';
  };
};

const capabilityToEngine: Record<
  CommercialEngineCapability,
  CommercialEngineId
> = {
  ADAPTIVE_MODELING: 'JUNGLE_BMOS',
  TELEMETRY_NORMALIZATION: 'BLACK_VEIN',
  PERFORMANCE_PLANNING: 'TERAFORMANCE',
  PROBABILISTIC_MODELING: 'QUANTUM_SYSTEMS',
  CROSS_SYSTEM_ROUTING: 'MERCURY',
  SCENARIO_SYNTHESIS: 'MORPHEUS',
  REALIZATION_PLANNING: 'NEO',
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function prepareCommercialEngineRoute(
  request: CommercialRouteRequest,
): CommercialRoutePlan {
  const requested = request.requestedCapabilities.map(
    (capability) => capabilityToEngine[capability],
  );

  const route: CommercialEngineId[] = ['MERCURY'];

  if (request.includeScenarioExploration === true) {
    route.push('MORPHEUS');
  }

  route.push(...requested.filter((engine) => engine !== 'MERCURY'));

  if (request.includeRealizationPlanning === true) {
    route.push('NEO');
  }

  const normalizedRoute = unique(route);
  const qtceMembersUsed = normalizedRoute.filter((id) =>
    QTCE.members.includes(id as (typeof QTCE.members)[number]),
  );

  for (const id of normalizedRoute) {
    getCommercialEngine(id);
  }

  return {
    runtimeCeiling: 'A2',
    route: normalizedRoute,
    qtceMembersUsed,
    notes: [
      'Mercury prepares the route; it does not execute live reconfiguration.',
      'Morpheus scenarios remain hypotheses until evidence validates them.',
      'Neo prepares realization plans; it does not mark them realized.',
      'Quantum Systems means probabilistic/quantum-inspired modeling only.',
      'Teraformance is a performance-planning substrate; scale claims require measured evidence.',
    ],
    executionDecision: {
      decision: 'DENY',
      reasonCode: 'A3_EXECUTION_NOT_ADMITTED',
    },
  };
}
