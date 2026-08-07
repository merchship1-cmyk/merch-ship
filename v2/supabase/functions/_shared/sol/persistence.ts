type SupabaseClientLike = {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{
    data: unknown;
    error: { code?: string; message?: string } | null;
  }>;
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => {
      select: (columns: string) => {
        single: () => Promise<{
          data: Record<string, unknown> | null;
          error: { code?: string; message?: string } | null;
        }>;
      };
    };
    select: (columns: string) => {
      eq: (column: string, value: unknown) => {
        maybeSingle: () => Promise<{
          data: Record<string, unknown> | null;
          error: { code?: string; message?: string } | null;
        }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => Promise<{
        error: { code?: string; message?: string } | null;
      }>;
    };
  };
};

const fail = (prefix: string, error: { code?: string; message?: string } | null) => {
  throw new Error(`${prefix}: ${error?.code ?? error?.message ?? 'unknown database error'}`);
};

export async function claimEvent(
  client: SupabaseClientLike,
  args: {
    sourceSystem: 'slack' | 'linear';
    sourceEventId: string;
    commandId: string;
  },
): Promise<boolean> {
  const { data, error } = await client.rpc('sol_claim_event', {
    p_source_system: args.sourceSystem,
    p_source_event_id: args.sourceEventId,
    p_command_id: args.commandId,
  });
  if (error) fail('SOL event claim failed', error);
  return data === true;
}

export async function finalizeEvent(
  client: SupabaseClientLike,
  args: {
    sourceSystem: 'slack' | 'linear';
    sourceEventId: string;
    commandId: string;
    command: string;
    lane: number;
    status: 'completed' | 'blocked' | 'failed';
    payload: Record<string, unknown>;
  },
): Promise<string> {
  const { data, error } = await client.rpc('sol_finalize_event', {
    p_source_system: args.sourceSystem,
    p_source_event_id: args.sourceEventId,
    p_command_id: args.commandId,
    p_command: args.command,
    p_lane: args.lane,
    p_status: args.status,
    p_payload: args.payload,
  });
  if (error || typeof data !== 'string') fail('SOL evidence finalization failed', error);
  return data as string;
}

export async function enqueueSlackDelivery(
  client: SupabaseClientLike,
  args: {
    dedupeKey: string;
    channelId: string;
    threadTs?: string;
    text: string;
  },
): Promise<string> {
  const { data, error } = await client
    .from('sol_delivery_outbox')
    .insert({
      dedupe_key: args.dedupeKey,
      destination: 'slack',
      action: 'post_message',
      payload: {
        channelId: args.channelId,
        threadTs: args.threadTs,
        text: args.text,
      },
    })
    .select('id')
    .single();

  if (!error && typeof data?.id === 'string') return data.id;
  if (error?.code !== '23505') fail('SOL outbox enqueue failed', error);

  const existing = await client
    .from('sol_delivery_outbox')
    .select('id')
    .eq('dedupe_key', args.dedupeKey)
    .maybeSingle();
  if (existing.error || typeof existing.data?.id !== 'string') {
    fail('SOL outbox lookup failed', existing.error);
  }
  return String(existing.data?.id);
}

export async function markDelivery(
  client: SupabaseClientLike,
  args: { id: string; sent: boolean; error?: string },
): Promise<void> {
  const { error } = await client.rpc('sol_mark_delivery', {
    p_delivery_id: args.id,
    p_sent: args.sent,
    p_error: args.error ?? null,
  });
  if (error) fail('SOL outbox update failed', error);
}

export async function recordSyncCheckpoint(
  client: SupabaseClientLike,
  args: {
    sourceEventId: string;
    entityId: string;
    eventType: string;
    resultHash: string;
  },
): Promise<void> {
  const { error } = await client
    .from('sol_sync_checkpoints')
    .insert({
      source_system: 'linear',
      source_event_id: args.sourceEventId,
      entity_id: args.entityId,
      event_type: args.eventType,
      result_hash: args.resultHash,
    })
    .select('source_event_id')
    .single();
  if (error && error.code !== '23505') fail('SOL checkpoint write failed', error);
}

export async function getDelivery(
  client: SupabaseClientLike,
  id: string,
): Promise<{
  id: string;
  status: string;
  payload: Record<string, unknown>;
} | null> {
  const result = await client
    .from('sol_delivery_outbox')
    .select('id,status,payload')
    .eq('id', id)
    .maybeSingle();
  if (result.error) fail('SOL outbox read failed', result.error);
  if (!result.data) return null;
  return {
    id: String(result.data.id),
    status: String(result.data.status),
    payload: result.data.payload as Record<string, unknown>,
  };
}

export async function findDeliveryByDedupeKey(
  client: SupabaseClientLike,
  dedupeKey: string,
): Promise<{ id: string; status: string } | null> {
  const result = await client
    .from('sol_delivery_outbox')
    .select('id,status')
    .eq('dedupe_key', dedupeKey)
    .maybeSingle();
  if (result.error) fail('SOL outbox lookup failed', result.error);
  if (!result.data) return null;
  return { id: String(result.data.id), status: String(result.data.status) };
}
