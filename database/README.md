# MERCH SHIP — Database Layer

Drizzle ORM schema, migrations, and seed data for the MERCH SHIP commerce engine.

## Stack

| Tool | Purpose |
|---|---|
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe query builder and schema definition |
| [postgres.js](https://github.com/porsager/postgres) | PostgreSQL driver |
| [drizzle-kit](https://orm.drizzle.team/kit-docs/overview) | Migration generation and management |
| PostgreSQL | Database (v14+) |
| TypeScript | All source files |

## Schema

| Table | Description |
|---|---|
| `users` | Customers, staff, and admin accounts |
| `products` | Digital and physical product catalog |
| `inventory` | Per-product stock and reservation tracking |
| `orders` | Customer orders with line items |
| `order_items` | Individual line items within an order |
| `events` | Audit log for all system, user, and agent actions |

## Setup

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run migrations

```bash
npm run db:migrate
```

### 4. Seed demo data

```bash
npm run db:seed
```

## Scripts

| Script | Description |
|---|---|
| `npm run db:generate` | Generate a new migration from schema changes |
| `npm run db:migrate` | Apply pending migrations to the database |
| `npm run db:push` | Push schema directly (dev shortcut — no migration file) |
| `npm run db:seed` | Populate database with demo data |
| `npm run db:studio` | Open Drizzle Studio visual browser |
| `npm run db:check` | Check for schema/migration drift |
| `npm run typecheck` | TypeScript type check |

## Using the client (backend)

```ts
import { db, products, orders, users } from '@merch-ship/database/src/client';

// Query example
const activeProducts = await db
  .select()
  .from(products)
  .where(eq(products.status, 'active'));
```

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `DATABASE_LOG_QUERIES` | ❌ | Set to `true` to log all SQL queries |
| `DATABASE_MAX_CONNECTIONS` | ❌ | Connection pool size (default: 10) |
