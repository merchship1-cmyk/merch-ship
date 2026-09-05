import { requiredFields, ensureArray } from '../../utils/validation.js';

export const moduleDefinition = {
  id: 'DELIVERY_ENGINE',
  lane: 'delivery',
  purpose: 'Ensure delivery matches the commercial promise and remains synchronized.'
};

export const alignDelivery = (input) => {
  const required = requiredFields(input, ['promise', 'deliverables']);
  if (!required.valid) {
    return { status: 'blocked', errors: [`Missing required delivery fields: ${required.missing.join(', ')}`] };
  }

  const deliverables = ensureArray(input.deliverables);
  const gaps = ensureArray(input.promisedOutcomes).filter((outcome) => !deliverables.some((deliverable) => String(deliverable).toLowerCase().includes(String(outcome).toLowerCase())));

  return {
    status: gaps.length ? 'needs_alignment' : 'aligned',
    delivery: {
      promise: input.promise,
      deliverables,
      accessMethod: input.accessMethod || 'digital-download',
      supportWindow: input.supportWindow || '7 days',
      gaps
    }
  };
};
