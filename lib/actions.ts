"use server"

import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { eq, and, count, isNull, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { hosts, hostGroups, updateLog, clients, webhooks } from "./schema"
import { dispatchWebhook } from "./webhooks"
import { getSession } from "./auth"
import { getTeamContext } from "./team-context"
import { getPlanLimit, canCustomizeCredentials } from "./plans"
import { deleteDnsRecord } from "./dns"
import { sendPasswordResetEmail, sendFeedbackEmail } from "./email"

// Returns the effective where-clause owner for hosts/groups
async function getOwnerScope(session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const team = await getTeamContext(session.id)
  if (team) return { teamId: team.teamId, clientId: null as null, plan: team.team.plan, role: team.role }
  return { teamId: null as null, clientId: session.id, plan: session.plan, role: "owner" as const }
}

function hostScope(scope: { teamId: number | null; clientId: number | null }) {
  if (scope.teamId !== null) return eq(hosts.teamId, scope.teamId)
  return and(eq(hosts.clientId, scope.clientId!), isNull(hosts.teamId))
}

function groupScope(scope: { teamId: number | null; clientId: number | null }) {
  if (scope.teamId !== null) return eq(hostGroups.teamId, scope.teamId)
  return and(eq(hostGroups.clientId, scope.clientId!), isNull(hostGroups.teamId))
}

function token() {
  return randomBytes(32).toString("hex")
}

/** Random 10-char lowercase alphanumeric username */
function genUsername() {
  return randomBytes(6).toString("hex") // 12 hex chars → take 10
    .slice(0, 10)
}

/** Random password in the format xxxx-xxxx-xxxx — easy to enter on router UIs */
function genPassword() {
  const seg = () => randomBytes(2).toString("hex") // 4 hex chars per segment
  return `${seg()}-${seg()}-${seg()}`
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

async function checkPlanLimit(scope: { teamId: number | null; clientId: number | null }, plan: string) {
  const limit = getPlanLimit(plan)
  const [{ value }] = await db.select({ value: count() }).from(hosts)
    .where(and(hostScope(scope), eq(hosts.active, true)))
  if (value >= limit) return { error: "plan_limit" }
  return null
}

// ── Create (redirect variant — used by the /hosts/new page) ─────────
export async function createHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope   = await getOwnerScope(session)
  const limited = await checkPlanLimit(scope, scope.plan)
  if (limited) return limited

  const subdomain = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const customUsername = canCustomizeCredentials(scope.plan)
    ? String(formData.get("username") ?? "").trim() || null
    : null
  const customPassword = canCustomizeCredentials(scope.plan)
    ? String(formData.get("password") ?? "").trim() || null
    : null

  if (customUsername) {
    const taken = await db.query.hosts.findFirst({ where: eq(hosts.username, customUsername) })
    if (taken) return { error: "Username already taken" }
  }

  const username = customUsername ?? genUsername()
  const password = customPassword ?? genPassword()

  const [inserted] = await db.insert(hosts).values({
    clientId: scope.clientId, teamId: scope.teamId, subdomain, description, ttl,
    token: token(), username, passwordHash: await hash(password, 10),
  }).returning()

  const base = process.env.BASE_DOMAIN ?? "novadns.io"
  const webhookOwner = scope.teamId ?? session.id
  dispatchWebhook(webhookOwner, "host.created", {
    host: { id: inserted.id, subdomain: inserted.subdomain, fqdn: `${inserted.subdomain}.${base}`, ttl: inserted.ttl },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ── Create (returns result — used by the sheet) ──────────────────────
export async function addHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope   = await getOwnerScope(session)
  const limited = await checkPlanLimit(scope, scope.plan)
  if (limited) return limited

  const subdomain   = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl         = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const customUsername = canCustomizeCredentials(scope.plan)
    ? String(formData.get("username") ?? "").trim() || null
    : null
  const customPassword = canCustomizeCredentials(scope.plan)
    ? String(formData.get("password") ?? "").trim() || null
    : null

  if (customUsername) {
    const taken = await db.query.hosts.findFirst({ where: eq(hosts.username, customUsername) })
    if (taken) return { error: "Username already taken" }
  }

  const username = customUsername ?? genUsername()
  const password = customPassword ?? genPassword()

  const [inserted] = await db.insert(hosts).values({
    clientId: scope.clientId, teamId: scope.teamId, subdomain, description, ttl,
    token: token(), username, passwordHash: await hash(password, 10),
  }).returning()

  const base = process.env.BASE_DOMAIN ?? "novadns.io"
  const webhookOwner = scope.teamId ?? session.id
  dispatchWebhook(webhookOwner, "host.created", {
    host: { id: inserted.id, subdomain: inserted.subdomain, fqdn: `${inserted.subdomain}.${base}`, ttl: inserted.ttl },
  })

  revalidatePath("/dashboard")
  return { ok: true, username, password }
}

// ── Update ──────────────────────────────────────────────────────────
export async function updateHost(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), hostScope(scope)),
  })
  if (!host) return { error: "Not found" }

  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))
  const active = formData.get("active") === "true"

  await db.update(hosts).set({ description, ttl, active, updatedAt: new Date() }).where(eq(hosts.id, id))

  if (active !== host.active) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    dispatchWebhook(session.id, "host.status_changed", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl },
      active,
    })
  }

  revalidatePath(`/dashboard/hosts/${id}`)
  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Regenerate token ────────────────────────────────────────────────
export async function regenerateToken(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  await db
    .update(hosts)
    .set({ token: token(), updatedAt: new Date() })
    .where(and(eq(hosts.id, id), hostScope(scope)))

  revalidatePath(`/dashboard/hosts/${id}`)
}

// ── Regenerate password ─────────────────────────────────────────────
export async function regenerateHostPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const host = await db.query.hosts.findFirst({ where: and(eq(hosts.id, id), hostScope(scope)) })
  if (!host) return { error: "Not found" }

  const password = genPassword()
  const username = host.username ?? genUsername() // generate username if somehow missing

  await db
    .update(hosts)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hosts.id, id))

  revalidatePath(`/dashboard/hosts/${id}`)
  return { username, password }
}

// ── Set custom credentials (Pro+) ───────────────────────────────────
export async function setHostCredentials(id: number, username: string, password: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  if (!canCustomizeCredentials(scope.plan)) return { error: "plan_limit" }

  username = username.trim()
  password = password.trim()

  if (!username) return { error: "Username is required" }
  if (username.length > 32) return { error: "Username too long (max 32 chars)" }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: "Username may only contain letters, numbers, _ and -" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  const host = await db.query.hosts.findFirst({ where: and(eq(hosts.id, id), hostScope(scope)) })
  if (!host) return { error: "Not found" }

  if (username !== host.username) {
    const taken = await db.query.hosts.findFirst({ where: eq(hosts.username, username) })
    if (taken) return { error: "Username already taken" }
  }

  await db
    .update(hosts)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hosts.id, id))

  revalidatePath(`/dashboard/hosts/${id}`)
  return { ok: true }
}

// ── Delete (redirect variant — used by the detail page) ─────────────
export async function deleteHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), hostScope(scope)),
  })

  if (host) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    const webhookOwner = scope.teamId ?? session.id
    dispatchWebhook(webhookOwner, "host.deleted", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl: host.ttl },
    })
  }

  await db.delete(hosts).where(and(eq(hosts.id, id), hostScope(scope)))

  if (host?.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
  if (host?.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ── Delete (returns result — used by the sheet) ──────────────────────
export async function removeHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), hostScope(scope)),
  })

  if (host) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    const webhookOwner = scope.teamId ?? session.id
    dispatchWebhook(webhookOwner, "host.deleted", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl: host.ttl },
    })
  }

  await db.delete(hosts).where(and(eq(hosts.id, id), hostScope(scope)))

  if (host?.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
  if (host?.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)

  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Fetch helpers (used by server components) ───────────────────────
export async function getHosts() {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  return db.query.hosts.findMany({
    where: hostScope(scope),
    orderBy: (h, { desc }) => [desc(h.createdAt)],
  })
}

export async function getHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  return db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), hostScope(scope)),
  })
}

export async function getUpdateLog(hostId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, hostId), hostScope(scope)),
  })
  if (!host) return []

  return db.query.updateLog.findMany({
    where: eq(updateLog.hostId, hostId),
    orderBy: (l, { desc }) => [desc(l.createdAt)],
    limit: 50,
  })
}

// ── Group actions ────────────────────────────────────────────────

export async function addGroup(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  if (!canCustomizeCredentials(scope.plan)) return { error: "plan_limit" }

  const name        = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!name) return { error: "Name is required" }

  let username = String(formData.get("username") ?? "").trim()
  let password = String(formData.get("password") ?? "").trim()

  if (username || password) {
    if (!username) return { error: "Username is required when setting custom credentials" }
    if (username.length > 32) return { error: "Username too long (max 32 chars)" }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: "Username may only contain letters, numbers, _ and -" }
    if (password.length < 6) return { error: "Password must be at least 6 characters" }
    const taken = await db.query.hostGroups.findFirst({ where: eq(hostGroups.username, username) })
    if (taken) return { error: "Username already taken" }
  } else {
    username = genUsername()
    password = genPassword()
  }

  await db.insert(hostGroups).values({
    clientId: scope.clientId, teamId: scope.teamId, name, description,
    username, passwordHash: await hash(password, 10),
  })

  revalidatePath("/dashboard/groups")
  return { ok: true, username, password }
}

export async function updateGroup(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const group = await db.query.hostGroups.findFirst({
    where: and(eq(hostGroups.id, id), groupScope(scope)),
  })
  if (!group) return { error: "Not found" }

  const name        = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!name) return { error: "Name is required" }

  await db.update(hostGroups)
    .set({ name, description, updatedAt: new Date() })
    .where(eq(hostGroups.id, id))

  revalidatePath("/dashboard/groups")
  return { ok: true }
}

export async function removeGroup(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  await db.delete(hostGroups)
    .where(and(eq(hostGroups.id, id), groupScope(scope)))

  revalidatePath("/dashboard/groups")
  return { ok: true }
}

export async function setGroupCredentials(id: number, username: string, password: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  if (!canCustomizeCredentials(scope.plan)) return { error: "plan_limit" }

  username = username.trim()
  password = password.trim()

  if (!username) return { error: "Username is required" }
  if (username.length > 32) return { error: "Username too long (max 32 chars)" }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: "Username may only contain letters, numbers, _ and -" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  const group = await db.query.hostGroups.findFirst({ where: and(eq(hostGroups.id, id), groupScope(scope)) })
  if (!group) return { error: "Not found" }

  if (username !== group.username) {
    const taken = await db.query.hostGroups.findFirst({ where: eq(hostGroups.username, username) })
    if (taken) return { error: "Username already taken" }
  }

  await db
    .update(hostGroups)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hostGroups.id, id))

  revalidatePath("/dashboard/groups")
  return { ok: true }
}

export async function regenerateGroupPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  if (!canCustomizeCredentials(scope.plan)) return { error: "plan_limit" }

  const password = genPassword()

  await db.update(hostGroups)
    .set({ passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(and(eq(hostGroups.id, id), groupScope(scope)))

  revalidatePath("/dashboard/groups")
  return { password }
}

export async function getGroups() {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const groups = await db.query.hostGroups.findMany({
    where: groupScope(scope),
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  })

  // Attach host counts
  const counts = await db
    .select({ groupId: hosts.groupId, value: count() })
    .from(hosts)
    .where(hostScope(scope))
    .groupBy(hosts.groupId)

  const countMap = new Map(counts.map(c => [c.groupId, c.value]))
  return groups.map(g => ({ ...g, hostCount: countMap.get(g.id) ?? 0 }))
}

export async function getGroupHosts(groupId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)
  const group = await db.query.hostGroups.findFirst({
    where: and(eq(hostGroups.id, groupId), groupScope(scope)),
  })
  if (!group) return []

  return db.query.hosts.findMany({
    where: and(eq(hosts.groupId, groupId), hostScope(scope)),
    orderBy: (h, { asc }) => [asc(h.subdomain)],
  })
}

export async function assignHostToGroup(hostId: number, groupId: number | null) {
  const session = await getSession()
  if (!session) redirect("/login")

  const scope = await getOwnerScope(session)

  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, hostId), hostScope(scope)),
  })
  if (!host) return { error: "Host not found" }

  if (groupId !== null) {
    const group = await db.query.hostGroups.findFirst({
      where: and(eq(hostGroups.id, groupId), groupScope(scope)),
    })
    if (!group) return { error: "Group not found" }
  }

  await db.update(hosts)
    .set({ groupId, updatedAt: new Date() })
    .where(eq(hosts.id, hostId))

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/groups")
  return { ok: true }
}

// ── Feedback ─────────────────────────────────────────────────────

export async function submitFeedback(formData: FormData) {
  const session = await getSession()
  if (!session) return { error: "Not authenticated" }

  const message = String(formData.get("message") ?? "").trim()
  if (!message) return { error: "Message is required" }
  if (message.length > 2000) return { error: "Message too long" }

  try {
    await sendFeedbackEmail(session.email, message)
    return { ok: true }
  } catch {
    return { error: "Failed to send feedback. Please try again." }
  }
}

// ── Password reset ───────────────────────────────────────────────

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!email) return { error: "Email is required" }

  const client = await db.query.clients.findFirst({ where: eq(clients.email, email) })

  // Always return success — don't leak whether the email exists
  if (!client) return { ok: true }

  const resetToken      = randomBytes(32).toString("hex")
  const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await db.update(clients)
    .set({ resetToken, resetTokenExpiresAt, updatedAt: new Date() })
    .where(eq(clients.id, client.id))

  await sendPasswordResetEmail(client.email, resetToken)

  return { ok: true }
}

// ── Webhook actions ──────────────────────────────────────────────

export async function getWebhooks() {
  const session = await getSession()
  if (!session) redirect("/login")

  return db.query.webhooks.findMany({
    where: eq(webhooks.clientId, session.id),
    orderBy: (w, { desc }) => [desc(w.createdAt)],
  })
}

export async function addWebhook(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const url    = String(formData.get("url") ?? "").trim()
  const events = formData.getAll("events").join(",")

  if (!url)    return { error: "URL is required" }
  if (!events) return { error: "Select at least one event" }

  const secret = token()

  await db.insert(webhooks).values({
    clientId: session.id, url, events, secret,
  })

  revalidatePath("/dashboard/webhooks")
  return { ok: true, secret }
}

export async function updateWebhook(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const webhook = await db.query.webhooks.findFirst({
    where: and(eq(webhooks.id, id), eq(webhooks.clientId, session.id)),
  })
  if (!webhook) return { error: "Not found" }

  const url    = String(formData.get("url") ?? "").trim()
  const events = formData.getAll("events").join(",")
  const active = formData.get("active") === "true"

  if (!url)    return { error: "URL is required" }
  if (!events) return { error: "Select at least one event" }

  await db.update(webhooks)
    .set({ url, events, active, updatedAt: new Date() })
    .where(eq(webhooks.id, id))

  revalidatePath("/dashboard/webhooks")
  return { ok: true }
}

export async function removeWebhook(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  await db.delete(webhooks)
    .where(and(eq(webhooks.id, id), eq(webhooks.clientId, session.id)))

  revalidatePath("/dashboard/webhooks")
  return { ok: true }
}

export async function regenerateWebhookSecret(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const secret = token()

  await db.update(webhooks)
    .set({ secret, updatedAt: new Date() })
    .where(and(eq(webhooks.id, id), eq(webhooks.clientId, session.id)))

  revalidatePath("/dashboard/webhooks")
  return { secret }
}

export async function unlinkMicrosoft() {
  const session = await getSession()
  if (!session) redirect("/login")

  if (!session.passwordHash)
    return { error: "Set a password before unlinking Microsoft so you can still sign in" }

  await db.update(clients)
    .set({ microsoftId: null, updatedAt: new Date() })
    .where(eq(clients.id, session.id))

  revalidatePath("/dashboard/settings")
  return { ok: true }
}

export async function unlinkGoogle() {
  const session = await getSession()
  if (!session) redirect("/login")

  if (!session.passwordHash)
    return { error: "Set a password before unlinking Google so you can still sign in" }

  await db.update(clients)
    .set({ googleId: null, updatedAt: new Date() })
    .where(eq(clients.id, session.id))

  revalidatePath("/dashboard/settings")
  return { ok: true }
}

export async function resetPassword(formData: FormData) {
  const token    = String(formData.get("token")    ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!token || !password) return { error: "Invalid request" }
  if (password.length < 8)  return { error: "Password must be at least 8 characters" }

  const client = await db.query.clients.findFirst({
    where: eq(clients.resetToken, token),
  })

  if (!client?.resetTokenExpiresAt) return { error: "Invalid or expired link" }
  if (client.resetTokenExpiresAt < new Date()) return { error: "This link has expired — please request a new one" }

  await db.update(clients)
    .set({
      passwordHash:        await hash(password, 10),
      resetToken:          null,
      resetTokenExpiresAt: null,
      updatedAt:           new Date(),
    })
    .where(eq(clients.id, client.id))

  return { ok: true }
}
