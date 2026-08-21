const firstNamedKey = (value: string | undefined) => {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return typeof parsed.default === 'string' ? parsed.default : undefined;
  } catch {
    return undefined;
  }
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const publishableKey =
  firstNamedKey(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')) ??
  Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ??
  Deno.env.get('SUPABASE_ANON_KEY');
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const [scheme, token, extra] = authorization.trim().split(/\s+/);
  return scheme?.toLowerCase() === 'bearer' && token && !extra ? token : null;
};

async function readRows(
  table: string,
  filterColumn: string,
  runId: string,
  token: string,
  select: string,
) {
  if (!supabaseUrl || !publishableKey) {
    throw new Error('RLS probe is not configured.');
  }

  const endpoint = new URL(`${supabaseUrl}/rest/v1/${table}`);
  endpoint.searchParams.set('select', select);
  endpoint.searchParams.set(filterColumn, `eq.${runId}`);

  const response = await fetch(endpoint, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`RLS probe failed with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error('RLS probe returned an invalid response.');
  }
  return payload as Record<string, unknown>[];
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (!supabaseUrl || !publishableKey) {
    return json({ error: 'RLS probe is not configured.' }, 503);
  }

  const callerToken = getBearerToken(request);
  if (!callerToken) return json({ error: 'Unauthorized.' }, 401);

  let runId = '';
  let otherUserAccessToken = '';
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ error: 'Request body must be a JSON object.' }, 400);
    }
    const body = parsed as Record<string, unknown>;
    runId = typeof body.runId === 'string' ? body.runId.trim() : '';
    otherUserAccessToken =
      typeof body.otherUserAccessToken === 'string'
        ? body.otherUserAccessToken.trim()
        : '';
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (!runId || !otherUserAccessToken) {
    return json({ error: 'runId and otherUserAccessToken are required.' }, 400);
  }

  try {
    const [run, acceptance, evidence] = await Promise.all([
      readRows('zenzy_transformation_runs', 'id', runId, callerToken, 'id,status'),
      readRows(
        'zenzy_transformation_acceptance',
        'run_id',
        runId,
        callerToken,
        'id,run_id,accepted',
      ),
      readRows(
        'zenzy_transformation_evidence',
        'run_id',
        runId,
        callerToken,
        'id,run_id',
      ),
    ]);

    if (run.length !== 1) return json({ error: 'Owned run not found.' }, 404);
    if (acceptance.length !== 1 || acceptance[0]?.accepted !== true) {
      return json({ error: 'Acceptance proof is missing.' }, 400);
    }
    if (evidence.length !== 1) {
      return json({ error: 'Evidence proof is missing.' }, 400);
    }

    const [runToOther, acceptanceToOther, evidenceToOther] = await Promise.all([
      readRows('zenzy_transformation_runs', 'id', runId, otherUserAccessToken, 'id'),
      readRows(
        'zenzy_transformation_acceptance',
        'run_id',
        runId,
        otherUserAccessToken,
        'id',
      ),
      readRows(
        'zenzy_transformation_evidence',
        'run_id',
        runId,
        otherUserAccessToken,
        'id',
      ),
    ]);

    const isolationOk =
      runToOther.length === 0 &&
      acceptanceToOther.length === 0 &&
      evidenceToOther.length === 0;

    if (!isolationOk) {
      return json({ ok: false, reason: 'cross_user_visibility_detected' }, 409);
    }

    return json({
      ok: true,
      runId,
      runStatus: run[0]?.status,
      acceptanceId: acceptance[0]?.id,
      evidenceId: evidence[0]?.id,
      isolationOk: true,
    });
  } catch (error) {
    console.error(
      'Phase-1A evidence probe failed:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return json({ error: 'Isolation probe failed.' }, 502);
  }
});
