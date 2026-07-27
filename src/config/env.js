const numberFromEnv = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid numeric environment variable ${name}: ${raw}`);
  }
  return parsed;
};

export const env = {
  port: numberFromEnv('MERCH_SHIP_PORT', 3000),
  environment: process.env.MERCH_SHIP_ENV || 'development',
  storeUrl: process.env.MERCH_SHIP_STORE_URL || '',
  defaultCurrency: process.env.MERCH_SHIP_DEFAULT_CURRENCY || 'USD',
  minMarginPercent: numberFromEnv('MERCH_SHIP_MIN_MARGIN_PERCENT', 35),
  aiModel: process.env.MERCH_SHIP_AI_MODEL || 'gpt-5.3-codex'
};
