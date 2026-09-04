import {
  COMMERCIAL_ENGINE_REGISTRY,
  QTCE,
} from '../domain/commercialEngines';
import { prepareCommercialEngineRoute } from './commercialEngineRouter';

describe('Unified Commercial Engine v1', () => {
  it('defines QTCE without claiming A3+ runtime admission', () => {
    expect(QTCE.runtimeCeiling).toBe('A2');
    expect(QTCE.members).toEqual([
      'JUNGLE_BMOS',
      'BLACK_VEIN',
      'TERAFORMANCE',
      'QUANTUM_SYSTEMS',
    ]);
    expect(QTCE.conductor).toBe('MERCURY');
    expect(QTCE.scenarioEngine).toBe('MORPHEUS');
    expect(QTCE.realizationEngine).toBe('NEO');
  });

  it('keeps unverified substrate claims explicitly bounded', () => {
    const unverified = COMMERCIAL_ENGINE_REGISTRY.filter(
      (engine) => engine.status === 'DEFINED_NOT_RUNTIME_VERIFIED',
    ).map((engine) => engine.id);

    expect(unverified).toEqual([
      'JUNGLE_BMOS',
      'BLACK_VEIN',
      'TERAFORMANCE',
      'QUANTUM_SYSTEMS',
    ]);
  });

  it('routes scenario, adaptive, telemetry, performance and probabilistic planning through Mercury', () => {
    const plan = prepareCommercialEngineRoute({
      requestedCapabilities: [
        'ADAPTIVE_MODELING',
        'TELEMETRY_NORMALIZATION',
        'PERFORMANCE_PLANNING',
        'PROBABILISTIC_MODELING',
      ],
      includeScenarioExploration: true,
      includeRealizationPlanning: true,
    });

    expect(plan.route).toEqual([
      'MERCURY',
      'MORPHEUS',
      'JUNGLE_BMOS',
      'BLACK_VEIN',
      'TERAFORMANCE',
      'QUANTUM_SYSTEMS',
      'NEO',
    ]);
    expect(plan.qtceMembersUsed).toEqual([
      'JUNGLE_BMOS',
      'BLACK_VEIN',
      'TERAFORMANCE',
      'QUANTUM_SYSTEMS',
    ]);
    expect(plan.executionDecision).toEqual({
      decision: 'DENY',
      reasonCode: 'A3_EXECUTION_NOT_ADMITTED',
    });
  });

  it('does not overstate quantum or tera-scale capability', () => {
    const quantum = COMMERCIAL_ENGINE_REGISTRY.find(
      (engine) => engine.id === 'QUANTUM_SYSTEMS',
    );
    const teraformance = COMMERCIAL_ENGINE_REGISTRY.find(
      (engine) => engine.id === 'TERAFORMANCE',
    );

    expect(quantum?.prohibitedClaims.join(' ')).toContain('quantum advantage');
    expect(teraformance?.prohibitedClaims.join(' ')).toContain('tera-scale throughput');
  });
});
