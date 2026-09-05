export const calculateMarginPercent = ({ price, cost }) => {
  if (!price || price <= 0) return 0;
  return Number((((price - (cost || 0)) / price) * 100).toFixed(2));
};

export const calculatePriceFromMargin = ({ cost, marginPercent }) => {
  const margin = Math.min(Math.max(Number(marginPercent || 0), 0), 95);
  const denominator = 1 - (margin / 100);
  return Number(((Number(cost || 0)) / denominator).toFixed(2));
};
