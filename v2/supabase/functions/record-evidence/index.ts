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

const asInteger = (value: unknown) =>
  typeof value === 'number' && Number.isInteger(value) ? value : null;

const mapEvidence = (row: Record<string, unknown>) => ({
  runId: row.run_id,
  timeSavedMinutes: row.time_saved_minutes,
  stepsRemoved: row.steps_removed,
  clarityGain: row.clarity_gain,
  outputProduced: row.output_produced,
  wouldUseAgain: row.would_use_again,
  ...(typeof row.notes === 'string' ? { notes: row.notes } : {}),
  recordedAt: row.recorded_at,
});

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

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return json({ error: 'Request body must be a JSON object.' }, 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  if (
    Object.prototype.hasOwnProperty.call(body, 'user_id') ||
    Object.prototype.hasOwnProperty.call(body, 'userId')
  ) {
    return json({ error: 'Ownership is derived from the access token.' }, 400);
  }

  const runId = typeof body.runId === 'string' ? body.runId.trim() : '';
  const timeSavedMinutes = asInteger(body.timeSavedMinutes);
  const stepsRemoved = asInteger(body.stepsRemoved);
  const clarityGain = asInteger(body.clarityGain);
  const outputProduced =
    typeof body.outputProduced === 'boolean' ? body.outputProduced : null;
  const wouldUseAgain =
    typeof body.wouldUseAgain === 'boolean' ? body.wouldUseAgain : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : undefined;

  if (!runId) return json({ error: 'runId is required.' }, 400);
  if (timeSavedMinutes === null || timeSavedMinutes < 0 || timeSavedMinutes > 10080) {
    return json({ error: 'timeSavedMinutes is invalid.' }, 400);
  }
  if (stepsRemoved === null || stepsRemoved < 0 || stepsRemoved > 1000) {
    return json({ error: 'stepsRemoved is invalid.' }, 400);
  }
  if (clarityGain === null || clarityGain < 1 || clarityGain > 5) {
    return json({ error: 'clarityGain is invalid.' }, 400);
  }
  if (outputProduced === null || wouldUseAgain === null) {
    return json({ error: 'Evidence booleans are required.' }, 400);
  }
  if (notes && notes.length > 1000) {
    return json({ error: 'notes is too long.' }, 400);
  }

  const { data: run, error: runError } = await supabaseAdmin
    .from('zenzy_transformation_runs')
    .select('id,user_id,status')
    .eq('id', runId)
    .maybeSingle();
  if (runError) return json({ error: 'Run lookup failed.' }, 500);
  if (!run || run.user_id !== user.id) {
    return json({ error: 'Run not found.' }, 404);
  }

  const { data: acceptance, error: acceptanceError } = await supabaseAdmin
    .from('zenzy_transformation_acceptance')
    .select('id')
    .eq('run_id', runId)
    .eq('user_id', user.id)
    .eq('accepted', true)
    .maybeSingle();
  if (acceptanceError) return json({ error: 'Acceptance lookup failed.' }, 500);
  if (!acceptance) {
    return json({ error: 'Accept the next move before recording evidence.' }, 409);
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('zenzy_transformation_evidence')
    .select('*')
    .eq('run_id', runId)
    .maybeSingle();
  if (existingError) return json({ error: 'Evidence lookup failed.' }, 500);
  if (existing) return json(mapEvidence(existing));

  const { data: evidence, error: insertError } = await supabaseAdmin
    .from('zenzy_transformation_evidence')
    .insert({
      run_id: runId,
      time_saved_minutes: timeSavedMinutes,
      steps_removed: stepsRemoved,
      clarity_gain: clarityGain,
      output_produced: outputProduced,
      would_use_again: wouldUseAgain,
      notes: notes || null,
      recorded_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (insertError) {
    console.error('Evidence persistence failed:', insertError.code);
    return json({ error: 'Evidence could not be stored.' }, 500);
  }

  return json(mapEvidence(evidence));
});
