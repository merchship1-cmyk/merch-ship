import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const eventTypeEnum = pgEnum('event_type', [
  // Auth events
  'user.registered',
  'user.login',
  'user.logout',
  'user.password_reset',
  // Product events
  'product.created',
  'product.updated',
  'product.deleted',
  'product.status_changed',
  // Inventory events
  'inventory.updated',
  'inventory.low_stock',
  'inventory.out_of_stock',
  // Order events
  'order.created',
  'order.confirmed',
  'order.shipped',
  'order.delivered',
  'order.cancelled',
  'order.refunded',
  // Payment events
  'payment.initiated',
  'payment.succeeded',
  'payment.failed',
  // Agent events
  'agent.session_started',
  'agent.action_taken',
  'agent.session_ended',
  // System events
  'system.error',
  'system.webhook_received',
]);

export const events = pgTable(
  'events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: eventTypeEnum('type').notNull(),
    source: varchar('source', { length: 100 }).notNull().default('system'),
    actorId: uuid('actor_id'),
    resourceType: varchar('resource_type', { length: 100 }),
    resourceId: uuid('resource_id'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('events_type_idx').on(t.type),
    index('events_actor_id_idx').on(t.actorId),
    index('events_resource_idx').on(t.resourceType, t.resourceId),
    index('events_created_at_idx').on(t.createdAt),
  ],
);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
