export interface RoutingDecision {
  lane: number;
  confidence: number;
  matchedRules: string[];
  rationale: string;
  requiresFounderReview: boolean;
}

const laneRules = [
  { lane: 1, terms: ['ops', 'operations'] },
  { lane: 2, terms: ['bug', 'fix', 'broken', 'failure', 'regression'] },
  { lane: 3, terms: ['product', 'offer', 'feature', 'inventory'] },
  { lane: 4, terms: ['design', 'visual', 'brand', 'layout'] },
  { lane: 5, terms: ['ad', 'ads', 'campaign', 'audience', 'conversion'] },
  { lane: 7, terms: ['system', 'architecture', 'automation', 'integration'] },
  { lane: 8, terms: ['release', 'deploy', 'publish', 'launch'] },
] as const;

const confidenceThreshold = 0.7;

export function routeLane(text: string): RoutingDecision {
  const lower = text.toLowerCase();
  let selectedLane = 0;
  let selectedScore = 0;
  const matchedRules: string[] = [];

  for (const rule of laneRules) {
    const hits = rule.terms.filter((term) => lower.includes(term));
    if (hits.length === 0) continue;

    matchedRules.push(`lane-${rule.lane}:${hits.join(',')}`);
    const score = Math.min(1, 0.55 + hits.length * 0.2);
    if (score > selectedScore) {
      selectedLane = rule.lane;
      selectedScore = score;
    }
  }

  return {
    lane: selectedLane,
    confidence: selectedScore,
    matchedRules,
    rationale:
      selectedLane === 0
        ? 'No deterministic lane rule matched; routed to inbox.'
        : `Matched ${matchedRules.join(' | ')}`,
    requiresFounderReview: selectedScore < confidenceThreshold,
  };
}
