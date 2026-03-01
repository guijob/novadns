import { pgTable, serial, varchar, integer, boolean, timestamp, text } from "drizzle-orm/pg-core"

// ------------------------------------------------------------------
// Clients — SaaS customers
// ------------------------------------------------------------------
export const clients = pgTable("clients", {
  id:                    serial("id").primaryKey(),
  email:                 varchar("email", { length: 254 }).notNull().unique(),
  passwordHash:          varchar("password_hash", { length: 255 }).notNull(),
  name:                  varchar("name", { length: 100 }).notNull(),
  plan:                  varchar("plan", { length: 20 }).notNull().default("free"), // "free" | "starter" | "pro" | "business" | "enterprise"
  active:                boolean("active").notNull().default(true),
  resetToken:            varchar("reset_token", { length: 64 }),
  resetTokenExpiresAt:   timestamp("reset_token_expires_at"),
  stripeCustomerId:      varchar("stripe_customer_id",     { length: 255 }),
  stripeSubscriptionId:  varchar("stripe_subscription_id", { length: 255 }),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
})

// ------------------------------------------------------------------
// Host Groups — shared credentials for a set of hosts
// ------------------------------------------------------------------
export const hostGroups = pgTable("host_groups", {
  id:           serial("id").primaryKey(),
  clientId:     integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name:         varchar("name", { length: 100 }).notNull(),
  description:  text("description"),
  username:     varchar("username", { length: 32 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
})

// ------------------------------------------------------------------
// Hosts — each dynamic DNS entry a client owns
//   e.g.  subdomain="home"  →  home.<BASE_DOMAIN>
// ------------------------------------------------------------------
export const hosts = pgTable("hosts", {
  id:          serial("id").primaryKey(),
  clientId:    integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  groupId:     integer("group_id").references(() => hostGroups.id, { onDelete: "set null" }),
  subdomain:   varchar("subdomain", { length: 63 }).notNull().unique(), // RFC 1035 label limit
  ipv4:        varchar("ipv4", { length: 15 }),   // current A record value
  ipv6:        varchar("ipv6", { length: 39 }),   // current AAAA record value
  token:        varchar("token", { length: 64 }).notNull().unique(), // update auth token
  username:     varchar("username", { length: 32 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  ttl:         integer("ttl").notNull().default(60), // low TTL suits DDNS
  active:      boolean("active").notNull().default(true),
  lastSeenAt:  timestamp("last_seen_at"),
  lastSeenIp:  varchar("last_seen_ip", { length: 45 }), // IP that made the last update call
  description: text("description"),
  createdAt:   timestamp("created_at").notNull().defaultNow(),
  updatedAt:   timestamp("updated_at").notNull().defaultNow(),
})

// ------------------------------------------------------------------
// Update log — history of IP changes per host
// ------------------------------------------------------------------
export const updateLog = pgTable("update_log", {
  id:         serial("id").primaryKey(),
  hostId:     integer("host_id").notNull().references(() => hosts.id, { onDelete: "cascade" }),
  ipv4:       varchar("ipv4", { length: 15 }),
  ipv6:       varchar("ipv6", { length: 39 }),
  callerIp:   varchar("caller_ip", { length: 45 }).notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
})

// ------------------------------------------------------------------
// Webhooks — per-client HTTP callbacks for DNS events
// ------------------------------------------------------------------
export const webhooks = pgTable("webhooks", {
  id:        serial("id").primaryKey(),
  clientId:  integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  url:       varchar("url", { length: 2048 }).notNull(),
  events:    varchar("events", { length: 255 }).notNull(), // comma-separated
  secret:    varchar("secret", { length: 64 }).notNull(),  // HMAC-SHA256 signing key
  active:    boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type Client    = typeof clients.$inferSelect
export type HostGroup = typeof hostGroups.$inferSelect
export type Host      = typeof hosts.$inferSelect
export type UpdateLog = typeof updateLog.$inferSelect
export type Webhook   = typeof webhooks.$inferSelect
