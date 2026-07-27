import { alignOffer } from '../offer-engine/index.js';
import { routeProof } from '../proof-engine/index.js';
import { alignDelivery } from '../delivery-engine/index.js';

export const moduleDefinition = {
  id: 'SYNC.NODE.COMMERCE',
  lane: 'sync',
  purpose: 'Prevent drift across offers, pricing, messaging, delivery, and proof.'
};

const collectDrift = ({ offerResult, proofResult, deliveryResult }) => {
  const drift = [];

  if (offerResult.status !== 'aligned') drift.push({ area: 'offer', detail: offerResult.errors || ['Offer is not aligned.'] });
  if (proofResult.status !== 'routed') drift.push({ area: 'proof', detail: proofResult.errors || ['Proof is not routed.'] });
  if (deliveryResult.status !== 'aligned') drift.push({ area: 'delivery', detail: deliveryResult.delivery?.gaps || deliveryResult.errors || ['Delivery is not aligned.'] });
  if (offerResult.offer && deliveryResult.delivery && !deliveryResult.delivery.promise.includes(offerResult.offer.name)) {
    drift.push({ area: 'messaging', detail: ['Delivery promise should reference or directly support the offer name.'] });
  }
  if (proofResult.proof?.reviewRequired) drift.push({ area: 'proof', detail: ['Proof requires review before external display.'] });

  return drift;
};

export const runCommerceSync = (input, config = {}) => {
  const offerResult = alignOffer(input.offer || {}, config);
  const proofResult = routeProof(input.proof || {});
  const deliveryResult = alignDelivery(input.delivery || {});
  const drift = collectDrift({ offerResult, proofResult, deliveryResult });

  return {
    status: drift.length ? 'drift_detected' : 'synced',
    syncNode: moduleDefinition.id,
    timestamp: new Date().toISOString(),
    drift,
    lanes: {
      offer: offerResult,
      proof: proofResult,
      delivery: deliveryResult
    }
  };
};
