import { requiredFields, ensureArray } from '../../utils/validation.js';

export const moduleDefinition = {
  id: 'PROOF_ENGINE',
  lane: 'proof',
  purpose: 'Capture, route, and display proof across the ecosystem.'
};

export const routeProof = (input) => {
  const required = requiredFields(input, ['source', 'claim', 'evidenceType']);
  if (!required.valid) {
    return { status: 'blocked', errors: [`Missing required proof fields: ${required.missing.join(', ')}`] };
  }

  const surfaces = ensureArray(input.surfaces).length ? ensureArray(input.surfaces) : ['product-page', 'offer-page', 'internal-dashboard'];
  return {
    status: 'routed',
    proof: {
      source: input.source,
      claim: input.claim,
      evidenceType: input.evidenceType,
      confidence: input.confidence || 'unverified',
      surfaces,
      reviewRequired: input.confidence !== 'verified'
    }
  };
};
