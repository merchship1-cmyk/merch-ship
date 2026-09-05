import { calculateMarginPercent, calculatePriceFromMargin } from '../../utils/pricing.js';

export const moduleDefinition = {
  id: 'CREATOR_TOOLS',
  lane: 'tools',
  purpose: 'Expose calculators, dashboards, templates, and micro-app utilities for creators.'
};

export const pricingCalculator = ({ cost = 0, price, targetMarginPercent = 35 }) => {
  const recommendedPrice = calculatePriceFromMargin({ cost, marginPercent: targetMarginPercent });
  const activePrice = Number(price || recommendedPrice);
  return {
    cost: Number(cost),
    price: activePrice,
    recommendedPrice,
    marginPercent: calculateMarginPercent({ price: activePrice, cost: Number(cost) }),
    targetMarginPercent: Number(targetMarginPercent)
  };
};

export const dashboardSnapshot = (commerceSyncResult) => ({
  status: commerceSyncResult.status,
  driftCount: commerceSyncResult.drift?.length || 0,
  lanes: Object.keys(commerceSyncResult.lanes || {}),
  generatedAt: new Date().toISOString()
});
