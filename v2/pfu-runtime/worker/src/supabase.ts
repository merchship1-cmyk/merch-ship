import type {
  CanonicalEvent,
  EvidenceRecord,
  IngestResult,
  ProcessingRecord,
} from "./types.js";

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

interface EventIdentityRow {
  event_id: string;
}

export class LedgerPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerPersistenceError";
  }
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new LedgerPersistenceError(`${name} is not configured`);
  return value;
}

function loadConfig(): SupabaseConfig {
  return {
    url: requiredEnvironment("SUPABASE_URL").replace(/\/$/, ""),
    serviceRoleKey: requiredEnvironment("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function request<T>(
  path: string,
  init: RequestInit,
  prefer?: string,
): Promise<T> {
  const config = loadConfig();
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Profile": "public",
      "Content-Profile": "public",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(init.headers ?? {}),
    },
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new LedgerPersistenceError(
      `Supabase ledger request failed (${response.status}): ${raw.slice(0, 500)}`,
    );
  }

  return (raw.length > 0 ? JSON.parse(raw) : null) as T;
}

async function findExistingEvent(
  sourceSystem: string,
  sourceEventId: string,
): Promise<EventIdentityRow | null> {
  const params = new URLSearchParams();
  params.set("select", "event_id");
  params.set("source_system", `eq.${sourceSystem}`);
  params.set("source_event_id", `eq.${sourceEventId}`);
  params.set("limit", "1");

  const rows = await request<EventIdentityRow[]>(
    `pfu_events?${params.toString()}`,
    { method: "GET" },
  );
  return rows[0] ?? null;
}

export async function ingestEvent(event: CanonicalEvent): Promise<IngestResult> {
  const rows = await request<EventIdentityRow[]>(
    "pfu_events?on_conflict=source_system%2Csource_event_id",
    {
      method: "POST",
      body: JSON.stringify([event]),
    },
    "resolution=ignore-duplicates,return=representation",
  );

  const inserted = rows[0];
  if (inserted) {
    return { eventId: inserted.event_id, inserted: true };
  }

  const existing = await findExistingEvent(
    event.source_system,
    event.source_event_id,
  );
  if (!existing) {
    throw new LedgerPersistenceError(
      "Duplicate event was ignored but the canonical record could not be resolved",
    );
  }

  return { eventId: existing.event_id, inserted: false };
}

export async function appendProcessing(
  record: ProcessingRecord,
): Promise<void> {
  await request<unknown>(
    "pfu_event_processing",
    {
      method: "POST",
      body: JSON.stringify([record]),
    },
    "return=minimal",
  );
}

export async function appendEvidence(record: EvidenceRecord): Promise<void> {
  await request<unknown>(
    "pfu_evidence?on_conflict=evidence_id",
    {
      method: "POST",
      body: JSON.stringify([record]),
    },
    "resolution=ignore-duplicates,return=minimal",
  );
}
