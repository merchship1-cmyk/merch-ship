import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';
import { sha256Hex, verifyLinearRequest } from '../_shared/sol/crypto.ts';
import { postSlackMessage } from '../_shared/sol/external.ts';
import {
  claimEvent,
  enqueueSlackDelivery,
  finalizeEvent,
  getDelivery,
  markDelivery,
  recordSyncCheckpoint,
} from '../_shared/sol/persistence.ts';

type LinearPayload = {
  action?: string;
  type?: string;
  webhookTimestamp?: number;
  actor?: { id?: string; name?: string };
  data?: {
    id?: string;
    identifier?: string;
    title?: string;
    state?: { id?: string; name?: string };
  };
  updatedFrom?: Record<string, unknown>;
  url?: string;
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const required = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

const mutationsEnabled = () => Deno.env.get('SOL_MUTATIONS_ENABLED') === 'true';

async function deliverSlackOutbox(
  supabase: ReturnType<typeof createClient>,
  args: { outboxId: string; botToken: string },
): Promise<void> {
  const delivery = await getDelivery(supabase, args.outboxId);
  if (!delivery || delivery.status === 'sent') return;

  const channelId = delivery.payload.channelId;
  const text = delivery.payload.text;
  if (typeof channelId !== 'string' || typeof text !== 'string') {
    await markDelivery(supabase, {
      id: args.outboxId,
      sent: false,
      error: 'Invalid Slack outbox payload.',
    });
    throw new Error('Invalid Slack outbox payload.');
  }

  try {
    await postSlackMessage({ botToken: args.botToken, channelId, text });
    await markDelivery(supabase, { id: args.outboxId, sent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Slack delivery failed.';
    await markDelivery(supabase, {
      id: args.outboxId,
      sent: false,
      error: message,
    });
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const signingSecret = Deno.env.get('LINEAR_WEBHOOK_SECRET')?.trim();
  if (!signingSecret) return json({ error: 'Linear signing is not configured.' }, 503);

  const rawBody = await request.text();
  let payload: LinearPayload;
  try {
    payload = JSON.parse(rawBody) as LinearPayload;
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  const signatureValid = await verifyLinearRequest({
    rawBody,
    signature: request.headers.get('linear-signature'),
    webhookTimestamp: payload.webhookTimestamp,
    signingSecret,
  });
  if (!signatureValid) return json({ error: 'Invalid signature.' }, 401);

  const isIssueStateUpdate =
    payload.type === 'Issue' &&
    payload.action === 'update' &&
    Boolean(payload.updatedFrom) &&
    Object.prototype.hasOwnProperty.call(payload.updatedFrom, 'stateId');
  if (!isIssueStateUpdate) return json({ ignored: true });

  const sourceEventId = request.headers.get('linear-delivery')?.trim();
  const entityId = payload.data?.id?.trim();
  const issueTitle = payload.data?.title?.trim();
  const issueIdentifier = payload.data?.identifier?.trim() ?? entityId;
  const stateName = payload.data?.state?.name?.trim() ?? 'updated';
  if (!sourceEventId || !entityId || !issueTitle || !issueIdentifier) {
    return json({ error: 'Incomplete Linear webhook.' }, 400);
  }

  const supabaseUrl = required('SUPABASE_URL');
  const supabaseServerKey =
    Deno.env.get('SUPABASE_SECRET_KEY')?.trim() ||
    required('SUPABASE_SERVICE_ROLE_KEY');
  const slackBotToken = required('SLACK_BOT_TOKEN');
  const founderChannel = required('FOUNDER_SLACK_CHANNEL');
  const supabase = createClient(supabaseUrl, supabaseServerKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const commandId = `cmd_${crypto.randomUUID()}`;
  const claimed = await claimEvent(supabase, {
    sourceSystem: 'linear',
    sourceEventId,
    commandId,
  });
  if (!claimed) return json({ duplicate: true });

  if (!mutationsEnabled()) {
    await finalizeEvent(supabase, {
      sourceSystem: 'linear',
      sourceEventId,
      commandId,
      command: 'linear-status-sync',
      lane: 0,
      status: 'blocked',
      payload: { reason: 'mutations-disabled', entityId, stateName },
    });
    return json({ blocked: true });
  }

  try {
    const resultHash = await sha256Hex(`${entityId}:${stateName}:${rawBody}`);
    const text = [
      `SOL Linear update: *${issueIdentifier}*`,
      issueTitle,
      `Status: *${stateName}*`,
      payload.url ?? '',
    ]
      .filter(Boolean)
      .join('\n');

    const outboxId = await enqueueSlackDelivery(supabase, {
      dedupeKey: `linear-status:${sourceEventId}:${resultHash}`,
      channelId: founderChannel,
      text,
    });
    await deliverSlackOutbox(supabase, { outboxId, botToken: slackBotToken });
    await recordSyncCheckpoint(supabase, {
      sourceEventId,
      entityId,
      eventType: 'Issue.stateId.update',
      resultHash,
    });
    const evidenceId = await finalizeEvent(supabase, {
      sourceSystem: 'linear',
      sourceEventId,
      commandId,
      command: 'linear-status-sync',
      lane: 0,
      status: 'completed',
      payload: {
        entityId,
        issueIdentifier,
        stateName,
        actor: payload.actor,
        resultHash,
      },
    });
    return json({ ok: true, evidenceId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SOL Linear sync failed.';
    await finalizeEvent(supabase, {
      sourceSystem: 'linear',
      sourceEventId,
      commandId,
      command: 'linear-status-sync',
      lane: 0,
      status: 'failed',
      payload: { error: message, entityId, stateName },
    });
    console.error('SOL Linear webhook failed:', message);
    return json({ error: 'Linear sync failed.' }, 500);
  }
});
