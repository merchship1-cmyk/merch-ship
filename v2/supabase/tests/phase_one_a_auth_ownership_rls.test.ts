import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const migration = readFileSync(
  resolve(
    'supabase/migrations/20260801193000_phase_one_a_auth_ownership_rls.sql',
  ),
  'utf8',
);
const edgeFunction = readFileSync(
  resolve('supabase/functions/transform/index.ts'),
  'utf8',
);

describe('Phase-1A Slice-1 database contract', () => {
  it('refuses to invent ownership before making user_id mandatory', () => {
    expect(migration).toContain('where user_id is null');
    expect(migration).toContain('raise exception');
    expect(migration).toContain('alter column user_id set not null');
    expect(migration).toContain('references auth.users(id)');
  });

  it('grants authenticated users reads but no direct writes', () => {
    expect(migration).toContain(
      'grant select on public.zenzy_transformation_runs to authenticated',
    );
    expect(migration).toContain(
      'grant select on public.zenzy_transformation_evidence to authenticated',
    );
    expect(migration).not.toMatch(/grant\s+(insert|update|delete)/i);
  });

  it('limits reads to the run owner and linked evidence owner', () => {
    expect(migration).toContain('create policy runs_owner_select');
    expect(migration).toContain('(select auth.uid()) = user_id');
    expect(migration).toContain('create policy evidence_owner_select');
    expect(migration).toContain('owned_run.user_id = (select auth.uid())');
  });

  it('removes legacy client write policies on reapply', () => {
    for (const policy of [
      'runs_owner_insert',
      'runs_owner_update',
      'runs_owner_delete',
      'evidence_owner_insert',
      'evidence_owner_update',
      'evidence_owner_delete',
    ]) {
      expect(migration).toContain(`drop policy if exists ${policy}`);
    }
  });
});

describe('Phase-1A Slice-1 Edge contract', () => {
  it('validates the bearer token with Supabase Auth', () => {
    expect(edgeFunction).toContain('supabaseAdmin.auth.getUser(token)');
    expect(edgeFunction).toContain("return json({ error: 'Unauthorized.' }, 401)");
  });

  it('rejects forged ownership and derives user_id from the verified user', () => {
    expect(edgeFunction).toContain("hasOwnProperty.call(body, 'user_id')");
    expect(edgeFunction).toContain('user_id: user.id');
  });

  it('persists the validated output before returning it', () => {
    const insertPosition = edgeFunction.indexOf(".from('zenzy_transformation_runs')");
    const returnPosition = edgeFunction.lastIndexOf('return json(result)');
    expect(insertPosition).toBeGreaterThan(0);
    expect(returnPosition).toBeGreaterThan(insertPosition);
  });
});
