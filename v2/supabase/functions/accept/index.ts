import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServerKey =
  Deno.env.get('SUPABASE_SECRET_KEY') ??
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (!supabaseUrl || !supabaseServerKey) {
    return json({ error: 'Persistence service is not configured.' }, 503);
  }

  const token = getBearerToken(request);
  if (!token) return json({ error: 'Unauthorized.' }, 401);

  const supabaseAdmin = createClient(supabaseUrl, supabaseServerKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) return json({ error: 'Unauthorized.' }, 401);

  let runId = '';
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ error: 'Request body must be a JSON object.' }, 400);
    }
    const body = parsed as Record<string, unknown>;
    if (
      Object.prototype.hasOwnProperty.call(body, 'user_id') ||
      Object.prototype.hasOwnProperty.call(body, 'userId')
    ) {
      return json({ error: 'Ownership is derived from the access token.' }, 400);
    }
    runId = typeof body.runId === 'string' ? body.runId.trim() : '';
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (!runId) return json({ error: 'runId is required.' }, 400);

  const { data: run, error: runError } = await supabaseAdmin
    .from('zenzy_transformation_runs')
    .select('id,user_id,status')
    .eq('id', runId)
    .maybeSingle();

  if (runError) return json({ error: 'Run lookup failed.' }, 500);
  if (!run || run.user_id !== user.id) {
    return json({ error: 'Run not found.' }, 404);
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('zenzy_transformation_acceptance')
    .select('id,run_id,accepted,accepted_at')
    .eq('run_id', runId)
    .maybeSingle();

  if (existingError) return json({ error: 'Acceptance lookup failed.' }, 500);
  if (existing) {
    return json({
      runId: existing.run_id,
      accepted: existing.accepted,
      acceptedAt: existing.accepted_at,
    });
  }

  const { data: acceptance, error: insertError } = await supabaseAdmin
    .from('zenzy_transformation_acceptance')
    .insert({ run_id: runId, user_id: user.id, accepted: true })
    .select('id,run_id,accepted,accepted_at')
    .single();

  if (insertError) {
    console.error('Acceptance persistence failed:', insertError.code);
    return json({ error: 'Acceptance could not be stored.' }, 500);
  }

  return json({
    runId: acceptance.run_id,
    accepted: acceptance.accepted,
    acceptedAt: acceptance.accepted_at,
  });
});
