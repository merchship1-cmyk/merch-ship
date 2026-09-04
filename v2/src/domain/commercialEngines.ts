import { z } from 'zod';

export const COMMERCIAL_ENGINE_REGISTRY_VERSION = '1.0.0' as const;

export const commercialEngineIdSchema = z.enum([
  'JUNGLE_BMOS',
  'BLACK_VEIN',
  'TERAFORMANCE',
  'QUANTUM_SYSTEMS',
  'MERCURY',
  'MORPHEUS',
  'NEO',
]);
export type CommercialEngineId = z.infer<typeof commercialEngineIdSchema>;

export const commercialEngineStatusSchema = z.enum([
  'DEFINED_NOT_RUNTIME_VERIFIED',
  'A0_A2_PREPARATION_ADMITTED',
]);
export type CommercialEngineStatus = z.infer<typeof commercialEngineStatusSchema>;

export const commercialEngineCapabilitySchema = z.enum([
  'ADAPTIVE_MODELING',
  'TELEMETRY_NORMALIZATION',
  'PERFORMANCE_PLANNING',
  'PROBABILISTIC_MODELING',
  'CROSS_SYSTEM_ROUTING',
  'SCENARIO_SYNTHESIS',
  'REALIZATION_PLANNING',
]);
export type CommercialEngineCapability = z.infer<
  typeof commercialEngineCapabilitySchema
>;

export const commercialEngineDefinitionSchema = z.object({
  id: commercialEngineIdSchema,
  displayName: z.string().min(1),
  role: z.string().min(1),
  capabilities: z.array(commercialEngineCapabilitySchema).min(1),
  status: commercialEngineStatusSchema,
  runtimeClaims: z.array(z.string().min(1)),
  prohibitedClaims: z.array(z.string().min(1)).min(1),
});
export type CommercialEngineDefinition = z.infer<
  typeof commercialEngineDefinitionSchema
>;

export const COMMERCIAL_ENGINE_REGISTRY: readonly CommercialEngineDefinition[] = [
  {
    id: 'JUNGLE_BMOS',
    displayName: 'Jungle BMOS',
    role: 'Adaptive multi-agent and system-behavior modeling substrate.',
    capabilities: ['ADAPTIVE_MODELING'],
    status: 'DEFINED_NOT_RUNTIME_VERIFIED',
    runtimeClaims: [
      'May prepare adaptive-modeling plans and evidence requirements at A0-A2.',
    ],
    prohibitedClaims: [
      'No claim of autonomous biological intelligence or production self-evolution.',
    ],
  },
  {
    id: 'BLACK_VEIN',
    displayName: 'Black Vein',
    role: 'Commercial telemetry normalization and evidence-flow substrate.',
    capabilities: ['TELEMETRY_NORMALIZATION'],
    status: 'DEFINED_NOT_RUNTIME_VERIFIED',
    runtimeClaims: [
      'May define telemetry, provenance, and evidence-normalization contracts at A0-A2.',
    ],
    prohibitedClaims: [
      'No claim of verified ultra-high-speed, real-time, or opaque black-box production routing.',
    ],
  },
  {
    id: 'TERAFORMANCE',
    displayName: 'Teraformance',
    role: 'Performance, concurrency, capacity, and workload-planning substrate.',
    capabilities: ['PERFORMANCE_PLANNING'],
    status: 'DEFINED_NOT_RUNTIME_VERIFIED',
    runtimeClaims: [
      'May prepare load, capacity, concurrency, and performance test plans at A0-A2.',
    ],
    prohibitedClaims: [
      'No claim of tera-scale throughput or massive parallel runtime without measured evidence.',
    ],
  },
  {
    id: 'QUANTUM_SYSTEMS',
    displayName: 'Quantum Systems',
    role: 'Probabilistic and quantum-inspired scenario/optimization modeling substrate.',
    capabilities: ['PROBABILISTIC_MODELING'],
    status: 'DEFINED_NOT_RUNTIME_VERIFIED',
    runtimeClaims: [
      'May prepare probabilistic and quantum-inspired decision models at A0-A2.',
    ],
    prohibitedClaims: [
      'No claim of quantum-computer execution, quantum advantage, or predictive certainty.',
    ],
  },
  {
    id: 'MERCURY',
    displayName: 'Mercury Engine',
    role: 'Governed cross-system route-selection and adaptation planner.',
    capabilities: ['CROSS_SYSTEM_ROUTING'],
    status: 'A0_A2_PREPARATION_ADMITTED',
    runtimeClaims: [
      'May recommend and prepare a route across registered engines within an authorized A0-A2 mission.',
    ],
    prohibitedClaims: [
      'May not dynamically reconfigure live production systems or create authority.',
    ],
  },
  {
    id: 'MORPHEUS',
    displayName: 'Morpheus Engine',
    role: 'Governed scenario, alternative, and pattern-synthesis planner.',
    capabilities: ['SCENARIO_SYNTHESIS'],
    status: 'A0_A2_PREPARATION_ADMITTED',
    runtimeClaims: [
      'May generate evidence-tagged alternatives and what-if scenarios at A0-A2.',
    ],
    prohibitedClaims: [
      'May not promote a scenario into authorized execution or verified truth.',
    ],
  },
  {
    id: 'NEO',
    displayName: 'Neo Engine',
    role: 'Governed realization and instantiation planner for selected scenarios.',
    capabilities: ['REALIZATION_PLANNING'],
    status: 'A0_A2_PREPARATION_ADMITTED',
    runtimeClaims: [
      'May translate an authorized selected scenario into concrete PFU/MERCHSHIP/ZENZY mission-plan objects at A0-A2.',
    ],
    prohibitedClaims: [
      'May not activate production changes or mark planned state as realized without execution evidence.',
    ],
  },
] as const;

export const qtceSchema = z.object({
  id: z.literal('QTCE'),
  displayName: z.literal('Quantum–Teraformance Commercial Engine'),
  members: z.tuple([
    z.literal('JUNGLE_BMOS'),
    z.literal('BLACK_VEIN'),
    z.literal('TERAFORMANCE'),
    z.literal('QUANTUM_SYSTEMS'),
  ]),
  conductor: z.literal('MERCURY'),
  scenarioEngine: z.literal('MORPHEUS'),
  realizationEngine: z.literal('NEO'),
  runtimeCeiling: z.literal('A2'),
});

export const QTCE = qtceSchema.parse({
  id: 'QTCE',
  displayName: 'Quantum–Teraformance Commercial Engine',
  members: [
    'JUNGLE_BMOS',
    'BLACK_VEIN',
    'TERAFORMANCE',
    'QUANTUM_SYSTEMS',
  ],
  conductor: 'MERCURY',
  scenarioEngine: 'MORPHEUS',
  realizationEngine: 'NEO',
  runtimeCeiling: 'A2',
});

export function getCommercialEngine(
  id: CommercialEngineId,
): CommercialEngineDefinition {
  const engine = COMMERCIAL_ENGINE_REGISTRY.find((item) => item.id === id);
  if (engine === undefined) {
    throw new Error(`Unknown commercial engine: ${id}`);
  }
  return engine;
}
