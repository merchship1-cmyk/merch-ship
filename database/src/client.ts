import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema/index';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Copy database/.env.example to database/.env and configure it.',
  );
}

const isQueryLoggingEnabled = process.env.DATABASE_LOG_QUERIES === 'true';

// Create the postgres.js connection pool.
// In production, max connections are tuned per environment via DATABASE_MAX_CONNECTIONS.
const sql = postgres(process.env.DATABASE_URL, {
  max: process.env.DATABASE_MAX_CONNECTIONS
    ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
    : 10,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: isQueryLoggingEnabled ? console.info : undefined,
});

// Drizzle client with full schema — import `db` anywhere in the backend.
export const db = drizzle(sql, {
  schema,
  logger: isQueryLoggingEnabled,
});

// Export the raw postgres client for migrations and low-level use.
export { sql as pgClient };

// Re-export schema for convenient single-import access from the backend.
export * from './schema/index';
