import { requiredFields, ensureArray } from '../../utils/validation.js';
import { calculateMarginPercent, calculatePriceFromMargin } from '../../utils/pricing.js';

export const moduleDefinition = {
  id: 'OFFER_ENGINE',
  lane: 'commerce',
  purpose: 'Align offers, pricing, value props, and storefront messaging.'
};

export const alignOffer = (input, config = {}) => {
  const required = requiredFields(input, ['name', 'audience', 'valueProps']);
  if (!required.valid) {
    return { status: 'blocked', errors: [`Missing required offer fields: ${required.missing.join(', ')}`] };
  }

  const cost = Number(input.cost || 0);
  const requestedPrice = input.price === undefined ? undefined : Number(input.price);
  const minimumPrice = calculatePriceFromMargin({ cost, marginPercent: config.minMarginPercent || 35 });
  const price = requestedPrice && requestedPrice >= minimumPrice ? requestedPrice : minimumPrice;
  const marginPercent = calculateMarginPercent({ price, cost });

  return {
    status: 'aligned',
    offer: {
      name: input.name,
      audience: input.audience,
      promise: input.promise || `${input.name} helps ${input.audience} execute faster with less drift.`,
      valueProps: ensureArray(input.valueProps),
      price,
      currency: input.currency || config.defaultCurrency || 'USD',
      marginPercent,
      storefrontMessage: `${input.name}: ${ensureArray(input.valueProps).slice(0, 3).join(' • ')}`
    },
    checks: {
      marginProtected: marginPercent >= (config.minMarginPercent || 35),
      valuePropsPresent: ensureArray(input.valueProps).length > 0
    }
  };
};
