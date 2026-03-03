"use server"

import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { eq, and, count, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { hosts, hostGroups, updateLog, clients, webhooks, teams, teamMembers } from "./schema"
import { dispatchWebhook } from "./webhooks"
import { getSession } from "./auth"
import { resolveWorkspace } from "./workspace"
import { getPlanLimit, isPaidPlan, canCustomizeCredentials } from "./plans"
import { deleteDnsRecord } from "./dns"
import { sendPasswordResetEmail, sendFeedbackEmail } from "./email"
import { isValidSlug, findAvailableSlug } from "./slug"
import type { WorkspaceContext } from "./workspace"

// Derive scope from a WorkspaceContext for drizzle where clauses
function workspaceToScope(workspace: WorkspaceContext) {
  if (workspace.type === "team") return { teamId: workspace.teamId, clientId: null as null }
  return { teamId: null as null, clientId: workspace.clientId }
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

function genUsername() {
  return randomBytes(6).toString("hex").slice(0, 10)
}

function genPassword() {
  const seg = () => randomBytes(2).toString("hex")
  return `${seg()}-${seg()}-${seg()}`
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

async function getWorkspace(slug: string, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")
  return workspace
}

async function checkPlanLimit(scope: { teamId: number | null; clientId: number | null }, plan: string) {
  // Teams must have a paid plan — a free team has no host slots
  const limit = (scope.teamId !== null && plan === "free") ? 0 : getPlanLimit(plan)
  const [{ value }] = await db.select({ value: count() }).from(hosts)
    .where(and(hostScope(scope), eq(hosts.active, true)))
  if (value >= limit) return { error: "plan_limit" }
  return null
}

// Verify session has access to a host (by host ownership)
async function verifyHostAccess(hostId: number, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const host = await db.query.hosts.findFirst({ where: eq(hosts.id, hostId) })
  if (!host) return null
  if (host.clientId === session.id) return host
  if (host.teamId !== null) {
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, host.teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (membership) return host
  }
  return null
}

// Verify session has access to a group
async function verifyGroupAccess(groupId: number, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const group = await db.query.hostGroups.findFirst({ where: eq(hostGroups.id, groupId) })
  if (!group) return null
  if (group.clientId === session.id) return group
  if (group.teamId !== null) {
    const membership = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, group.teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (membership) return group
  }
  return null
}

// ── Create (redirect variant — used by the /hosts/new page) ─────────
export async function createHost(slug: string, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope     = workspaceToScope(workspace)
  const limited   = await checkPlanLimit(scope, workspace.plan)
  if (limited) return limited

  const subdomain   = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl         = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const customUsername = canCustomizeCredentials(workspace.plan)
    ? String(formData.get("username") ?? "").trim() || null
    : null
  const customPassword = canCustomizeCredentials(workspace.plan)
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
  const webhookOwner = scope.teamId !== null ? { teamId: scope.teamId } : { clientId: session.id }
  dispatchWebhook(webhookOwner, "host.created", {
    host: { id: inserted.id, subdomain: inserted.subdomain, fqdn: `${inserted.subdomain}.${base}`, ttl: inserted.ttl },
  })

  revalidatePath(`/${slug}`)
  redirect(`/${slug}`)
}

// ── Create (returns result — used by the sheet) ──────────────────────
export async function addHost(slug: string, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope     = workspaceToScope(workspace)
  const limited   = await checkPlanLimit(scope, workspace.plan)
  if (limited) return limited

  const subdomain   = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl         = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const customUsername = canCustomizeCredentials(workspace.plan)
    ? String(formData.get("username") ?? "").trim() || null
    : null
  const customPassword = canCustomizeCredentials(workspace.plan)
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
  const webhookOwner = scope.teamId !== null ? { teamId: scope.teamId } : { clientId: session.id }
  dispatchWebhook(webhookOwner, "host.created", {
    host: { id: inserted.id, subdomain: inserted.subdomain, fqdn: `${inserted.subdomain}.${base}`, ttl: inserted.ttl },
  })

  revalidatePath(`/${slug}`)
  return { ok: true, username, password }
}

// ── Update ──────────────────────────────────────────────────────────
export async function updateHost(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)
  if (!host) return { error: "Not found" }

  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))
  const active = formData.get("active") === "true"

  await db.update(hosts).set({ description, ttl, active, updatedAt: new Date() }).where(eq(hosts.id, id))

  if (active !== host.active) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    const webhookOwner = host.teamId !== null ? { teamId: host.teamId } : { clientId: session.id }
    dispatchWebhook(webhookOwner, "host.status_changed", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl },
      active,
    })
  }

  return { ok: true }
}

// ── Regenerate token ────────────────────────────────────────────────
export async function regenerateToken(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)
  if (!host) return

  await db
    .update(hosts)
    .set({ token: token(), updatedAt: new Date() })
    .where(eq(hosts.id, id))
}

// ── Regenerate password ─────────────────────────────────────────────
export async function regenerateHostPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)
  if (!host) return { error: "Not found" }

  const password = genPassword()
  const username = host.username ?? genUsername()

  await db
    .update(hosts)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hosts.id, id))

  return { username, password }
}

// ── Set custom credentials (Pro+) ───────────────────────────────────
export async function setHostCredentials(id: number, username: string, password: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)
  if (!host) return { error: "Not found" }

  // Determine plan for this host
  let plan = session.plan
  if (host.teamId !== null) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, host.teamId) })
    if (team) plan = team.plan
  }
  if (!canCustomizeCredentials(plan)) return { error: "plan_limit" }

  username = username.trim()
  password = password.trim()

  if (!username) return { error: "Username is required" }
  if (username.length > 32) return { error: "Username too long (max 32 chars)" }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: "Username may only contain letters, numbers, _ and -" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  if (username !== host.username) {
    const taken = await db.query.hosts.findFirst({ where: eq(hosts.username, username) })
    if (taken) return { error: "Username already taken" }
  }

  await db
    .update(hosts)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hosts.id, id))

  return { ok: true }
}

// ── Delete (redirect variant — used by the detail page) ─────────────
export async function deleteHost(slug: string, id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)

  if (host) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    const webhookOwner = host.teamId !== null ? { teamId: host.teamId } : { clientId: session.id }
    dispatchWebhook(webhookOwner, "host.deleted", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl: host.ttl },
    })
    await db.delete(hosts).where(eq(hosts.id, id))
    if (host.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
    if (host.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)
  }

  revalidatePath(`/${slug}`)
  redirect(`/${slug}`)
}

// ── Delete (returns result — used by the sheet) ──────────────────────
export async function removeHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(id, session)

  if (host) {
    const base = process.env.BASE_DOMAIN ?? "novadns.io"
    const webhookOwner = host.teamId !== null ? { teamId: host.teamId } : { clientId: session.id }
    dispatchWebhook(webhookOwner, "host.deleted", {
      host: { id: host.id, subdomain: host.subdomain, fqdn: `${host.subdomain}.${base}`, ttl: host.ttl },
    })
    await db.delete(hosts).where(eq(hosts.id, id))
    if (host.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
    if (host.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)
  }

  return { ok: true }
}

// ── Transfer host between workspaces ────────────────────────────────
export async function transferHost(hostId: number, destinationTeamId: number | null) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Load host
  const host = await db.query.hosts.findFirst({ where: eq(hosts.id, hostId) })
  if (!host) return { error: "Host not found" }

  // Verify source ownership
  if (host.teamId !== null) {
    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, host.teamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return { error: "Insufficient permissions" }
    }
  } else if (host.clientId !== session.id) {
    return { error: "Host not found" }
  }

  // Check destination access and capacity (only active hosts count toward the limit)
  if (destinationTeamId !== null) {
    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, destinationTeamId),
        eq(teamMembers.clientId, session.id),
        eq(teamMembers.accepted, true),
      ),
    })
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
      return { error: "No access to destination team" }
    }
    const destTeam = await db.query.teams.findFirst({ where: eq(teams.id, destinationTeamId) })
    if (!destTeam) return { error: "Destination team not found" }

    if (host.active) {
      const [{ value: activeCount }] = await db.select({ value: count() })
        .from(hosts).where(and(eq(hosts.teamId, destinationTeamId), eq(hosts.active, true)))
      const destLimit = isPaidPlan(destTeam.plan) ? getPlanLimit(destTeam.plan) : 0
      if (activeCount >= destLimit) {
        return { error: `${destTeam.name} has reached its host limit` }
      }
    }

    await db.update(hosts)
      .set({ teamId: destinationTeamId, clientId: null, groupId: null, updatedAt: new Date() })
      .where(eq(hosts.id, hostId))
  } else {
    if (host.active) {
      const [{ value: activeCount }] = await db.select({ value: count() })
        .from(hosts).where(and(eq(hosts.clientId, session.id), isNull(hosts.teamId), eq(hosts.active, true)))
      if (activeCount >= getPlanLimit(session.plan)) {
        return { error: "Personal workspace has reached its host limit" }
      }
    }

    await db.update(hosts)
      .set({ clientId: session.id, teamId: null, groupId: null, updatedAt: new Date() })
      .where(eq(hosts.id, hostId))
  }

  return { ok: true }
}

// ── Fetch helpers (used by server components) ───────────────────────
export async function getHosts(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)
  return db.query.hosts.findMany({
    where: hostScope(scope),
    orderBy: (h, { desc }) => [desc(h.createdAt)],
  })
}

export async function getHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  return verifyHostAccess(id, session)
}

export async function getUpdateLog(hostId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(hostId, session)
  if (!host) return []

  return db.query.updateLog.findMany({
    where: eq(updateLog.hostId, hostId),
    orderBy: (l, { desc }) => [desc(l.createdAt)],
    limit: 50,
  })
}

// ── Group actions ────────────────────────────────────────────────

export async function addGroup(slug: string, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)
  if (!canCustomizeCredentials(workspace.plan)) return { error: "plan_limit" }

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

  revalidatePath(`/${slug}/groups`)
  return { ok: true, username, password }
}

export async function updateGroup(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const group = await verifyGroupAccess(id, session)
  if (!group) return { error: "Not found" }

  const name        = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!name) return { error: "Name is required" }

  await db.update(hostGroups)
    .set({ name, description, updatedAt: new Date() })
    .where(eq(hostGroups.id, id))

  return { ok: true }
}

export async function removeGroup(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const group = await verifyGroupAccess(id, session)
  if (!group) return { error: "Not found" }

  await db.delete(hostGroups).where(eq(hostGroups.id, id))

  return { ok: true }
}

export async function setGroupCredentials(id: number, username: string, password: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const group = await verifyGroupAccess(id, session)
  if (!group) return { error: "Not found" }

  // Determine plan for this group
  let plan = session.plan
  if (group.teamId !== null) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, group.teamId) })
    if (team) plan = team.plan
  }
  if (!canCustomizeCredentials(plan)) return { error: "plan_limit" }

  username = username.trim()
  password = password.trim()

  if (!username) return { error: "Username is required" }
  if (username.length > 32) return { error: "Username too long (max 32 chars)" }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return { error: "Username may only contain letters, numbers, _ and -" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  if (username !== group.username) {
    const taken = await db.query.hostGroups.findFirst({ where: eq(hostGroups.username, username) })
    if (taken) return { error: "Username already taken" }
  }

  await db
    .update(hostGroups)
    .set({ username, passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hostGroups.id, id))

  return { ok: true }
}

export async function regenerateGroupPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const group = await verifyGroupAccess(id, session)
  if (!group) return { error: "Not found" }

  let plan = session.plan
  if (group.teamId !== null) {
    const team = await db.query.teams.findFirst({ where: eq(teams.id, group.teamId) })
    if (team) plan = team.plan
  }
  if (!canCustomizeCredentials(plan)) return { error: "plan_limit" }

  const password = genPassword()

  await db.update(hostGroups)
    .set({ passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(eq(hostGroups.id, id))

  return { password }
}

export async function getGroups(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await getWorkspace(slug, session)
  const scope = workspaceToScope(workspace)
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

  const group = await verifyGroupAccess(groupId, session)
  if (!group) return []

  const scope = { teamId: group.teamId, clientId: group.clientId }
  return db.query.hosts.findMany({
    where: and(eq(hosts.groupId, groupId), hostScope(scope)),
    orderBy: (h, { asc }) => [asc(h.subdomain)],
  })
}

export async function assignHostToGroup(hostId: number, groupId: number | null) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await verifyHostAccess(hostId, session)
  if (!host) return { error: "Host not found" }

  if (groupId !== null) {
    const group = await verifyGroupAccess(groupId, session)
    if (!group) return { error: "Group not found" }
    // Ensure they belong to the same workspace
    if (host.teamId !== group.teamId || host.clientId !== group.clientId) {
      return { error: "Host and group must be in the same workspace" }
    }
  }

  await db.update(hosts)
    .set({ groupId, updatedAt: new Date() })
    .where(eq(hosts.id, hostId))

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

async function webhookScope(workspace: WorkspaceContext) {
  return workspace.type === "team"
    ? and(eq(webhooks.teamId, workspace.teamId))
    : and(eq(webhooks.clientId, workspace.clientId))
}

async function ownedWebhook(id: number, workspace: WorkspaceContext) {
  const condition = workspace.type === "team"
    ? and(eq(webhooks.id, id), eq(webhooks.teamId, workspace.teamId))
    : and(eq(webhooks.id, id), eq(webhooks.clientId, workspace.clientId))
  return db.query.webhooks.findFirst({ where: condition })
}

export async function getWebhooks(slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  return db.query.webhooks.findMany({
    where: await webhookScope(workspace),
    orderBy: (w, { desc }) => [desc(w.createdAt)],
  })
}

export async function addWebhook(slug: string, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type === "team" && workspace.role === "member") {
    return { error: "Only admins can manage webhooks" }
  }

  const url    = String(formData.get("url") ?? "").trim()
  const events = formData.getAll("events").join(",")

  if (!url)    return { error: "URL is required" }
  if (!events) return { error: "Select at least one event" }

  const secret = token()
  const values = workspace.type === "team"
    ? { teamId: workspace.teamId, url, events, secret }
    : { clientId: workspace.clientId, url, events, secret }

  await db.insert(webhooks).values(values)

  return { ok: true, secret }
}

export async function updateWebhook(id: number, slug: string, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type === "team" && workspace.role === "member") {
    return { error: "Only admins can manage webhooks" }
  }

  const webhook = await ownedWebhook(id, workspace)
  if (!webhook) return { error: "Not found" }

  const url    = String(formData.get("url") ?? "").trim()
  const events = formData.getAll("events").join(",")
  const active = formData.get("active") === "true"

  if (!url)    return { error: "URL is required" }
  if (!events) return { error: "Select at least one event" }

  await db.update(webhooks)
    .set({ url, events, active, updatedAt: new Date() })
    .where(eq(webhooks.id, id))

  return { ok: true }
}

export async function removeWebhook(id: number, slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type === "team" && workspace.role === "member") {
    return { error: "Only admins can manage webhooks" }
  }

  await db.delete(webhooks)
    .where(workspace.type === "team"
      ? and(eq(webhooks.id, id), eq(webhooks.teamId, workspace.teamId))
      : and(eq(webhooks.id, id), eq(webhooks.clientId, workspace.clientId))
    )

  return { ok: true }
}

export async function regenerateWebhookSecret(id: number, slug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  const workspace = await resolveWorkspace(slug, session.id)
  if (!workspace) redirect("/login")

  if (workspace.type === "team" && workspace.role === "member") {
    return { secret: null, error: "Only admins can manage webhooks" }
  }

  const webhook = await ownedWebhook(id, workspace)
  if (!webhook) return { secret: null, error: "Not found" }

  const secret = token()

  await db.update(webhooks)
    .set({ secret, updatedAt: new Date() })
    .where(eq(webhooks.id, id))

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

// ── Slug management ──────────────────────────────────────────────

export async function updateClientSlug(newSlug: string) {
  const session = await getSession()
  if (!session) redirect("/login")

  if (!isValidSlug(newSlug)) return { error: "Invalid slug — must be 3-39 characters, lowercase letters, numbers, and hyphens only" }

  // Check uniqueness (excluding current client)
  const slug = await findAvailableSlug(newSlug, session.id)
  if (slug !== newSlug) return { error: "That username is already taken" }

  await db.update(clients)
    .set({ slug: newSlug, updatedAt: new Date() })
    .where(eq(clients.id, session.id))

  redirect(`/${newSlug}/settings`)
}
