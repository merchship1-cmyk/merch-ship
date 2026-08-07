import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.111.0';
import { verifySlackRequest } from '../_shared/sol/crypto.ts';
import { createLinearIssue, postSlackMessage } from '../_shared/sol/external.ts';
import {
  claimEvent,
  enqueueSlackDelivery,
  finalizeEvent,
  findDeliveryByDedupeKey,
  getDelivery,
  markDelivery,
} from '../_shared/sol/persistence.ts';
import { routeLane } from '../_shared/sol/routing.ts';

declare const EdgeRuntime: {
  waitUntil(promise: Promise<unknown>): void;
};

type SlackEnvelope = {
  type?: string;
  challenge?: string;
  event_id?: string;
  team_id?: string;
  event?: {
    type?: string;
    user?: string;
    text?: string;
    channel?: string;
    ts?: string;
    thread_ts?: string;
    bot_id?: string;
    subtype?: string;
  };
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

const authorizedActors = () =>
  new Set(
    [
      Deno.env.get('SOL_FOUNDER_SLACK_USER_ID'),
      ...(Deno.env.get('SOL_AUTHORIZED_SLACK_USER_IDS') ?? '').split(','),
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value)),
  );

const isSupportedCommand = (text: string) =>
  /\bsol\s+run this\b/i.test(text);

async function deliverSlackOutbox(
  supabase: ReturnType<typeof createClient>,
  args: {
    outboxId: string;
    botToken: string;
  },
): Promise<void> {
  const delivery = await getDelivery(supabase, args.outboxId);
  if (!delivery || delivery.status === 'sent') return;

  const channelId = delivery.payload.channelId;
  const text = delivery.payload.text;
  const threadTs = delivery.payload.threadTs;
  if (typeof channelId !== 'string' || typeof text !== 'string') {
    await markDelivery(supabase, {
      id: args.outboxId,
      sent: false,
      error: 'Invalid Slack outbox payload.',
    });
    throw new Error('Invalid Slack outbox payload.');
  }

  try {
    await postSlackMessage({
      botToken: args.botToken,
      channelId,
      text,
      threadTs: typeof threadTs === 'string' ? threadTs : undefined,
    });
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

async function processSlackEvent(payload: SlackEnvelope): Promise<void> {
  const supabaseUrl = required('SUPABASE_URL');
  const supabaseServerKey =
    Deno.env.get('SUPABASE_SECRET_KEY')?.trim() ||
    required('SUPABASE_SERVICE_ROLE_KEY');
  const slackBotToken = required('SLACK_BOT_TOKEN');
  const linearApiKey = required('LINEAR_API_KEY');
  const linearTeamId = required('LINEAR_TEAM_ID');
  const linearAssigneeId = Deno.env.get('LINEAR_ASSIGNEE_ID')?.trim();
  const supabase = createClient(supabaseUrl, supabaseServerKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const event = payload.event;
  if (
    payload.type !== 'event_callback' ||
    event?.type !== 'message' ||
    event.bot_id ||
    event.subtype === 'bot_message'
  ) {
    return;
  }

  const actorId = event.user?.trim();
  const channelId = event.channel?.trim();
  const messageTs = event.ts?.trim();
  const text = event.text?.trim() ?? '';
  if (!actorId || !channelId || !messageTs || !isSupportedCommand(text)) return;
  if (!authorizedActors().has(actorId)) return;

  const sourceEventId = payload.event_id?.trim() || `${channelId}:${messageTs}`;
  const commandId = `cmd_${crypto.randomUUID()}`;
  const claimed = await claimEvent(supabase, {
    sourceSystem: 'slack',
    sourceEventId,
    commandId,
  });
  if (!claimed) {
    const existingDelivery = await findDeliveryByDedupeKey(
      supabase,
      `slack-issue-reference:${sourceEventId}`,
    );
    if (existingDelivery && existingDelivery.status !== 'sent') {
      await deliverSlackOutbox(supabase, {
        outboxId: existingDelivery.id,
        botToken: slackBotToken,
      });
    }
    return;
  }

  const taskText = text
    .replace(/\bsol\s+run this\b/i, '')
    .replace(/^[:\-\s]+/, '')
    .trim();
  const routing = routeLane(taskText);
  if (taskText.length < 3) {
    await finalizeEvent(supabase, {
      sourceSystem: 'slack',
      sourceEventId,
      commandId,
      command: 'run',
      lane: routing.lane,
      status: 'blocked',
      payload: { reason: 'missing-task-payload', actorId, channelId },
    });
    return;
  }

  if (!mutationsEnabled()) {
    await finalizeEvent(supabase, {
      sourceSystem: 'slack',
      sourceEventId,
      commandId,
      command: 'run',
      lane: routing.lane,
      status: 'blocked',
      payload: { reason: 'mutations-disabled', actorId, channelId },
    });
    return;
  }

  let issue;
  try {
    issue = await createLinearIssue({
      apiKey: linearApiKey,
      teamId: linearTeamId,
      assigneeId: linearAssigneeId,
      title: taskText.slice(0, 120),
      description: [
        taskText,
        '',
        `SOL command: ${text}`,
        '',
        `Source: Slack`,
        `Slack team: ${payload.team_id ?? 'unknown'}`,
        `Slack channel: ${channelId}`,
        `Slack message ts: ${messageTs}`,
        `PFU lane: ${routing.lane}`,
        `SOL source event: ${sourceEventId}`,
      ].join('\n'),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Linear issue creation failed.';
    await finalizeEvent(supabase, {
      sourceSystem: 'slack',
      sourceEventId,
      commandId,
      command: 'run',
      lane: routing.lane,
      status: 'failed',
      payload: { error: message, actorId, channelId, routing },
    });
    console.error('SOL Slack event failed before mutation completion:', message);
    return;
  }

  const evidenceId = await finalizeEvent(supabase, {
    sourceSystem: 'slack',
    sourceEventId,
    commandId,
    command: 'run',
    lane: routing.lane,
    status: 'completed',
    payload: {
      actorId,
      channelId,
      messageTs,
      routing,
      linearIssue: issue,
    },
  });

  const reply = issue.url
    ? `SOL created Linear issue *${issue.identifier}*\n${issue.url}\nEvidence: ${evidenceId}`
    : `SOL created Linear issue *${issue.identifier}*\nEvidence: ${evidenceId}`;
  const outboxId = await enqueueSlackDelivery(supabase, {
    dedupeKey: `slack-issue-reference:${sourceEventId}`,
    channelId,
    threadTs: event.thread_ts ?? messageTs,
    text: reply,
  });

  try {
    await deliverSlackOutbox(supabase, { outboxId, botToken: slackBotToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Slack return delivery failed.';
    console.error('SOL Slack issue created; return delivery remains retryable:', message);
  }
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  const signingSecret = Deno.env.get('SLACK_SIGNING_SECRET')?.trim();
  if (!signingSecret) return json({ error: 'Slack signing is not configured.' }, 503);

  const rawBody = await request.text();
  const signatureValid = await verifySlackRequest({
    rawBody,
    timestamp: request.headers.get('x-slack-request-timestamp'),
    signature: request.headers.get('x-slack-signature'),
    signingSecret,
  });
  if (!signatureValid) return json({ error: 'Invalid signature.' }, 401);

  let payload: SlackEnvelope;
  try {
    payload = JSON.parse(rawBody) as SlackEnvelope;
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  if (payload.type === 'url_verification' && payload.challenge) {
    return json({ challenge: payload.challenge });
  }

  EdgeRuntime.waitUntil(
    processSlackEvent(payload).catch((error) => {
      const message = error instanceof Error ? error.message : 'Unknown background failure.';
      console.error('SOL Slack background task failed:', message);
    }),
  );
  return json({ accepted: true });
});
