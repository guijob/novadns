import { pgTable, serial, varchar, integer, boolean, timestamp, text } from "drizzle-orm/pg-core"

// ------------------------------------------------------------------
// Clients — SaaS customers
// ------------------------------------------------------------------
export const clients = pgTable("clients", {
  id:           serial("id").primaryKey(),
  email:        varchar("email", { length: 254 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name:         varchar("name", { length: 100 }).notNull(),
  active:       boolean("active").notNull().default(true),
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
  subdomain:   varchar("subdomain", { length: 63 }).notNull().unique(), // RFC 1035 label limit
  ipv4:        varchar("ipv4", { length: 15 }),   // current A record value
  ipv6:        varchar("ipv6", { length: 39 }),   // current AAAA record value
  token:       varchar("token", { length: 64 }).notNull().unique(), // update auth token
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

export type Client    = typeof clients.$inferSelect
export type Host      = typeof hosts.$inferSelect
export type UpdateLog = typeof updateLog.$inferSelect
