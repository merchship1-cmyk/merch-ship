export const requiredFields = (input, fields) => {
  const missing = fields.filter((field) => input?.[field] === undefined || input?.[field] === null || input?.[field] === '');
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true, missing: [] };
};

export const ensureArray = (value) => Array.isArray(value) ? value : [];

export const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
