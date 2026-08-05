import 'react-native-url-polyfill/auto';

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const chunkSize = 1800;
const manifestSuffix = '.chunks';

const secureStoreAdapter = {
  async getItem(key: string) {
    const manifest = await SecureStore.getItemAsync(key + manifestSuffix);
    if (!manifest) {
      return SecureStore.getItemAsync(key);
    }

    const chunkCount = Number.parseInt(manifest, 10);
    if (!Number.isSafeInteger(chunkCount) || chunkCount < 1) {
      return null;
    }

    const chunks = await Promise.all(
      Array.from({ length: chunkCount }, (_, index) =>
        SecureStore.getItemAsync(`${key}.${index}`),
      ),
    );

    return chunks.every((chunk): chunk is string => chunk !== null)
      ? chunks.join('')
      : null;
  },

  async setItem(key: string, value: string) {
    await secureStoreAdapter.removeItem(key);

    const chunks = value.match(new RegExp(`.{1,${chunkSize}}`, 'gs')) ?? [''];
    await Promise.all(
      chunks.map((chunk, index) =>
        SecureStore.setItemAsync(`${key}.${index}`, chunk),
      ),
    );
    await SecureStore.setItemAsync(key + manifestSuffix, String(chunks.length));
  },

  async removeItem(key: string) {
    const manifest = await SecureStore.getItemAsync(key + manifestSuffix);
    const chunkCount = manifest ? Number.parseInt(manifest, 10) : 0;

    if (Number.isSafeInteger(chunkCount) && chunkCount > 0) {
      await Promise.all(
        Array.from({ length: chunkCount }, (_, index) =>
          SecureStore.deleteItemAsync(`${key}.${index}`),
        ),
      );
    }

    await Promise.all([
      SecureStore.deleteItemAsync(key),
      SecureStore.deleteItemAsync(key + manifestSuffix),
    ]);
  },
};

const webStorage =
  Platform.OS === 'web' && typeof globalThis.localStorage !== 'undefined'
    ? globalThis.localStorage
    : secureStoreAdapter;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabasePublishableKey,
);

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          storage: webStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
