import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(
    'supabase/migrations/20260820235500_phase_one_a_acceptance_evidence.sql',
  ),
  'utf8',
);
const ownerHardeningMigration = readFileSync(
  resolve(
    'supabase/migrations/20260821000500_phase_one_a_evidence_owner_hardening.sql',
  ),
  'utf8',
);
const acceptFunction = readFileSync(
  resolve('supabase/functions/accept/index.ts'),
  'utf8',
);
const evidenceFunction = readFileSync(
  resolve('supabase/functions/record-evidence/index.ts'),
  'utf8',
);
const evidenceHook = readFileSync(
  resolve('supabase/functions/zenzy-evidence-hook/index.ts'),
  'utf8',
);

describe('Phase-1A Slice-2 persistence contract', () => {
  it('stores one affirmative acceptance per owned run', () => {
    expect(migration).toContain('zenzy_transformation_acceptance');
    expect(migration).toContain('accepted boolean not null check (accepted is true)');
    expect(migration).toContain('unique (run_id)');
    expect(migration).toContain('foreign key (run_id, user_id)');
  });

  it('keeps acceptance writes server-only and owner reads RLS-scoped', () => {
    expect(migration).toContain(
      'revoke all on public.zenzy_transformation_acceptance from anon, authenticated',
    );
    expect(migration).toContain(
      'grant select on public.zenzy_transformation_acceptance to authenticated',
    );
    expect(migration).toContain('create policy acceptance_owner_select');
    expect(migration).not.toMatch(/grant\s+(insert|update|delete)/i);
  });

  it('requires acceptance before evidence and makes evidence one-per-run', () => {
    expect(migration).toContain('zenzy_before_evidence_insert');
    expect(migration).toContain('Phase-1A acceptance is required before evidence.');
    expect(migration).toContain('zenzy_transformation_evidence_run_id_uidx');
  });

  it('binds evidence to the same verified owner as the run and acceptance', () => {
    expect(ownerHardeningMigration).toContain(
      'zenzy_transformation_evidence_owner_fkey',
    );
    expect(ownerHardeningMigration).toContain('foreign key (run_id, user_id)');
    expect(ownerHardeningMigration).toContain(
      'accepted_run.user_id = new.user_id',
    );
  });

  it('moves run state through reviewed and verified from database triggers', () => {
    expect(migration).toContain("set status = 'reviewed'");
    expect(migration).toContain("set status = 'verified'");
  });
});

describe('Phase-1A Slice-2 function contract', () => {
  it('derives acceptance ownership from the bearer token', () => {
    expect(acceptFunction).toContain('supabaseAdmin.auth.getUser(token)');
    expect(acceptFunction).toContain('run.user_id !== user.id');
    expect(acceptFunction).toContain('user_id: user.id');
  });

  it('blocks evidence until the authenticated owner has accepted', () => {
    expect(evidenceFunction).toContain(".from('zenzy_transformation_acceptance')");
    expect(evidenceFunction).toContain(".eq('user_id', user.id)");
    expect(evidenceFunction).toContain('Accept the next move before recording evidence.');
    expect(evidenceFunction).toContain('user_id: user.id');
  });

  it('supports hosted Supabase key maps while preserving legacy fallbacks', () => {
    expect(acceptFunction).toContain('SUPABASE_SECRET_KEYS');
    expect(evidenceFunction).toContain('SUPABASE_SECRET_KEYS');
    expect(evidenceHook).toContain('SUPABASE_PUBLISHABLE_KEYS');
  });

  it('uses user-scoped REST probes rather than a service role for isolation', () => {
    expect(evidenceHook).toContain('otherUserAccessToken');
    expect(evidenceHook).toContain('Authorization: `Bearer ${token}`');
    expect(evidenceHook).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(evidenceHook).not.toContain('SUPABASE_SECRET_KEY');
  });
});
