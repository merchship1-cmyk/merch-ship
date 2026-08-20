import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const requireText = (path: string, text: string) => {
  if (!read(path).includes(text)) {
    throw new Error(`${path} is missing required Phase-1A contract text: ${text}`);
  }
};

for (const [path, text] of [
  ['src/screens/AuthScreen.tsx', 'testID="login-email"'],
  ['src/screens/StartScreen.tsx', 'testID="input-textarea"'],
  ['src/screens/ClarityAcceptanceScreen.tsx', 'testID="accept-next-move"'],
  ['src/screens/TransformationScreen.tsx', 'testID="execution-screen"'],
  ['src/screens/TransformationScreen.tsx', 'testID="review-outcome"'],
  ['src/screens/OutcomeScreen.tsx', 'testID="outcome-screen"'],
  ['supabase/functions/accept/index.ts', "auth.getUser(token)"],
  ['supabase/functions/record-evidence/index.ts', 'zenzy_transformation_acceptance'],
  ['supabase/functions/zenzy-evidence-hook/index.ts', 'otherUserAccessToken'],
  ['phase1a/mobile-sim/e2e/phase1a.detox.js', 'accept-next-move'],
  ['../.github/workflows/zenzy-phase1a.yml', 'Phase 1A / Required Gate'],
] as const) {
  requireText(path, text);
}

for (const path of [
  'phase1a/orchestrator/config.ts',
  'phase1a/orchestrator/api.ts',
  'phase1a/orchestrator/run.ts',
  'supabase/functions/zenzy-evidence-hook/index.ts',
]) {
  const content = read(path);
  if (
    content.includes('SUPABASE_SERVICE_ROLE_KEY') ||
    content.includes('SUPABASE_SECRET_KEY')
  ) {
    throw new Error(`${path} must not receive or use a Supabase server key.`);
  }
}

console.log('Phase-1A static contract: PASS');
