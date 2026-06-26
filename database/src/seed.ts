/**
 * Seed script — populates the database with representative demo data.
 * Run with: npm run db:seed  (from the database/ directory)
 *
 * Safe to run multiple times — uses upsert / ON CONFLICT DO NOTHING semantics
 * so it won't duplicate rows on re-runs.
 */
import 'dotenv/config';
import { createHash, randomUUID } from 'node:crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql as drizzleSql } from 'drizzle-orm';
import * as schema from './schema/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fakeHash(password: string): string {
  // NOT a real password hash — only for demo/seed data.
  return `$seed$${createHash('sha256').update(password).digest('hex')}`;
}

function slug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set.');
}

const pgClient = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(pgClient, { schema });

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@merch-ship.dev',
    hashedPassword: fakeHash('admin-password'),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'staff@merch-ship.dev',
    hashedPassword: fakeHash('staff-password'),
    firstName: 'Staff',
    lastName: 'Member',
    role: 'staff' as const,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'customer@merch-ship.dev',
    hashedPassword: fakeHash('customer-password'),
    firstName: 'Demo',
    lastName: 'Customer',
    role: 'customer' as const,
  },
];

const SEED_PRODUCTS = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Founder Execution System',
    slug: 'founder-execution-system',
    description:
      'A complete digital system for founders to plan, execute, and scale their business. Includes templates, frameworks, and AI-ready workflows.',
    price: '97.00',
    compareAtPrice: '197.00',
    sku: 'FES-001',
    images: ['/products/founder-execution-system-cover.png'],
    tags: ['digital', 'productivity', 'founder'],
    status: 'active' as const,
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Digital Startup System',
    slug: 'digital-startup-system',
    description:
      'Everything a new startup needs to hit the ground running — brand kit, SOPs, legal templates, and a governed product launch framework.',
    price: '147.00',
    compareAtPrice: '297.00',
    sku: 'DSS-001',
    images: ['/products/digital-startup-system-cover.png'],
    tags: ['digital', 'startup', 'governance'],
    status: 'active' as const,
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'MERCH SHIP To-Do App',
    slug: 'merch-ship-todo-app',
    description:
      'A browser-ready productivity utility with local storage persistence, task filters, and responsive UI. The first live MERCH SHIP digital product.',
    price: '0.00',
    compareAtPrice: null,
    sku: 'TODO-001',
    images: ['/products/todo-app-cover.png'],
    tags: ['digital', 'free', 'app'],
    status: 'active' as const,
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Commerce OS Blueprint',
    slug: 'commerce-os-blueprint',
    description: 'Architecture blueprint for building a governed, multi-layer commerce engine.',
    price: '49.00',
    compareAtPrice: null,
    sku: 'COB-001',
    images: [],
    tags: ['digital', 'architecture', 'shopify'],
    status: 'draft' as const,
  },
];

const SEED_INVENTORY = SEED_PRODUCTS.map((p) => ({
  productId: p.id,
  // Digital products — effectively unlimited; we track stock as a convention.
  quantity: 9999,
  reserved: 0,
}));

const SEED_ORDERS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    orderNumber: 'MSHIP-0001',
    userId: '00000000-0000-0000-0000-000000000003',
    status: 'delivered' as const,
    subtotal: '97.00',
    taxAmount: '8.73',
    shippingAmount: '0.00',
    total: '105.73',
    currency: 'USD',
    shippingAddress: {
      name: 'Demo Customer',
      line1: '123 Commerce St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
    },
  },
];

const SEED_ORDER_ITEMS = [
  {
    orderId: '20000000-0000-0000-0000-000000000001',
    productId: '10000000-0000-0000-0000-000000000001',
    productTitle: 'Founder Execution System',
    productSku: 'FES-001',
    quantity: 1,
    unitPrice: '97.00',
    lineTotal: '97.00',
  },
];

const SEED_EVENTS: schema.NewEvent[] = [
  {
    type: 'user.registered',
    source: 'seed',
    actorId: '00000000-0000-0000-0000-000000000003',
    resourceType: 'user',
    resourceId: '00000000-0000-0000-0000-000000000003',
    payload: { email: 'customer@merch-ship.dev' },
  },
  {
    type: 'order.created',
    source: 'seed',
    actorId: '00000000-0000-0000-0000-000000000003',
    resourceType: 'order',
    resourceId: '20000000-0000-0000-0000-000000000001',
    payload: { orderNumber: 'MSHIP-0001', total: '105.73' },
  },
  {
    type: 'order.delivered',
    source: 'seed',
    actorId: '00000000-0000-0000-0000-000000000003',
    resourceType: 'order',
    resourceId: '20000000-0000-0000-0000-000000000001',
    payload: { orderNumber: 'MSHIP-0001' },
  },
];

// ---------------------------------------------------------------------------
// Seed runner
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱  Starting MERCH SHIP database seed…\n');

  // Users
  console.log('  → Seeding users…');
  for (const user of SEED_USERS) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`     ✓ ${SEED_USERS.length} users`);

  // Products
  console.log('  → Seeding products…');
  for (const product of SEED_PRODUCTS) {
    await db
      .insert(schema.products)
      .values(product)
      .onConflictDoUpdate({
        target: schema.products.id,
        set: {
          title: product.title,
          description: product.description,
          price: product.price,
          status: product.status,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`     ✓ ${SEED_PRODUCTS.length} products`);

  // Inventory
  console.log('  → Seeding inventory…');
  for (const inv of SEED_INVENTORY) {
    await db
      .insert(schema.inventory)
      .values(inv)
      .onConflictDoUpdate({
        target: schema.inventory.productId,
        set: {
          quantity: inv.quantity,
          reserved: inv.reserved,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`     ✓ ${SEED_INVENTORY.length} inventory records`);

  // Orders
  console.log('  → Seeding orders…');
  for (const order of SEED_ORDERS) {
    await db
      .insert(schema.orders)
      .values(order)
      .onConflictDoUpdate({
        target: schema.orders.id,
        set: { status: order.status, updatedAt: new Date() },
      });
  }
  console.log(`     ✓ ${SEED_ORDERS.length} orders`);

  // Order items
  console.log('  → Seeding order items…');
  for (const item of SEED_ORDER_ITEMS) {
    await db
      .insert(schema.orderItems)
      .values(item)
      .onConflictDoNothing();
  }
  console.log(`     ✓ ${SEED_ORDER_ITEMS.length} order items`);

  // Events
  console.log('  → Seeding events…');
  for (const event of SEED_EVENTS) {
    await db.insert(schema.events).values(event).onConflictDoNothing();
  }
  console.log(`     ✓ ${SEED_EVENTS.length} events`);

  console.log('\n✅  Seed complete.\n');
}

seed()
  .catch((err) => {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  })
  .finally(() => pgClient.end());
