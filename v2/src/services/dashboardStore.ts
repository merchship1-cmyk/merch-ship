import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  dashboardSnapshotSchema,
  type DashboardSnapshot,
} from '../domain/dashboard';

const keyPrefix = 'zenzy.dashboard.v1';

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function storageKey(ownerKey: string) {
  const safeOwner = ownerKey.replace(/[^A-Za-z0-9._-]/g, '_');
  return `${keyPrefix}.${safeOwner}`;
}

function getBrowserStorage(): BrowserStorage | null {
  return (
    (globalThis as unknown as { localStorage?: BrowserStorage }).localStorage ??
    null
  );
}

async function readRaw(key: string) {
  if (Platform.OS === 'web') {
    return getBrowserStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function writeRaw(key: string, value: string) {
  if (Platform.OS === 'web') {
    getBrowserStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

export async function loadDashboardSnapshot(
  ownerKey: string,
): Promise<DashboardSnapshot | null> {
  const raw = await readRaw(storageKey(ownerKey));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = dashboardSnapshotSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveDashboardSnapshot(
  ownerKey: string,
  snapshot: DashboardSnapshot,
) {
  const validated = dashboardSnapshotSchema.parse(snapshot);
  await writeRaw(storageKey(ownerKey), JSON.stringify(validated));
}
