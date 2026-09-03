import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  activeRunSessionSchema,
  type ActiveRunSession,
} from '../domain/activeRun';

const keyPrefix = 'zenzy.active-run.v1';

type BrowserStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
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

async function removeRaw(key: string) {
  if (Platform.OS === 'web') {
    getBrowserStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function loadActiveRunSession(
  ownerKey: string,
): Promise<ActiveRunSession | null> {
  const raw = await readRaw(storageKey(ownerKey));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = activeRunSessionSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveActiveRunSession(
  ownerKey: string,
  session: ActiveRunSession,
) {
  const validated = activeRunSessionSchema.parse(session);
  await writeRaw(storageKey(ownerKey), JSON.stringify(validated));
}

export async function clearActiveRunSession(ownerKey: string) {
  await removeRaw(storageKey(ownerKey));
}
