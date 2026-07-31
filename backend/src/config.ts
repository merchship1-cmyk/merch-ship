import { z } from 'zod';

const runtimeSchema = z.object({
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  ALLOWED_ORIGIN: z.string().min(1).default('http://localhost:8081'),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default('gpt-5.6-sol'),
  OPENAI_REASONING_EFFORT: z.enum(['none', 'minimal', 'low', 'medium', 'high']).default('low'),
  SUPABASE_URL: z.url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1).optional(),
});

export type RuntimeConfig = z.infer<typeof runtimeSchema>;

let cachedConfig: RuntimeConfig | undefined;

export function getRuntimeConfig(): RuntimeConfig {
  cachedConfig ??= runtimeSchema.parse(process.env);
  return cachedConfig;
}

export function runtimeReadiness() {
  const names = [
    'OPENAI_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ] as const;

  const missing = names.filter((name) => !process.env[name]?.trim());
  return { ready: missing.length === 0, missing };
}

export function resetRuntimeConfigForTests() {
  cachedConfig = undefined;
}
