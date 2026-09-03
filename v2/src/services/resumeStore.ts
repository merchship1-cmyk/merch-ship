import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  resumeStateSchema,
  type ResumeState,
} from '../domain/resume';

const keyPrefix = 'zenzy.resume.v1';

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

export async function loadResumeState(
  ownerKey: string,
): Promise<ResumeState | null> {
  const raw = await readRaw(storageKey(ownerKey));
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    const result = resumeStateSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function saveResumeState(ownerKey: string, state: ResumeState) {
  const validated = resumeStateSchema.parse(state);
  await writeRaw(storageKey(ownerKey), JSON.stringify(validated));
}
