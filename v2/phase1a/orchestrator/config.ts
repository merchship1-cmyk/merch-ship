const required = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required Phase-1A environment variable: ${name}`);
  return value;
};

export const SUPABASE_URL = required('SUPABASE_URL').replace(/\/$/, '');
export const SUPABASE_PUBLISHABLE_KEY = required('SUPABASE_PUBLISHABLE_KEY');
export const TEST_USER_A_EMAIL = required('TEST_USER_A_EMAIL');
export const TEST_USER_A_PASSWORD = required('TEST_USER_A_PASSWORD');
export const TEST_USER_B_EMAIL = required('TEST_USER_B_EMAIL');
export const TEST_USER_B_PASSWORD = required('TEST_USER_B_PASSWORD');

export const FUNCTIONS_BASE =
  process.env.ZENZY_FUNCTIONS_BASE?.replace(/\/$/, '') ??
  `${SUPABASE_URL}/functions/v1`;

export const endpoints = {
  transform: process.env.ZENZY_TRANSFORM_URL ?? `${FUNCTIONS_BASE}/transform`,
  accept: process.env.ZENZY_ACCEPT_URL ?? `${FUNCTIONS_BASE}/accept`,
  evidence:
    process.env.ZENZY_EVIDENCE_URL ?? `${FUNCTIONS_BASE}/record-evidence`,
  evidenceHook:
    process.env.ZENZY_EVIDENCE_HOOK_URL ??
    `${FUNCTIONS_BASE}/zenzy-evidence-hook`,
};
