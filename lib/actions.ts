"use server"

import { randomBytes } from "crypto"
import { hash } from "bcryptjs"
import { eq, and, count, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { hosts, hostGroups, updateLog, clients } from "./schema"
import { getSession } from "./auth"
import { deleteDnsRecord } from "./dns"
import { sendPasswordResetEmail, sendFeedbackEmail } from "./email"

const FREE_LIMIT = 3

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

async function checkPlanLimit(clientId: number, plan: string) {
  if (plan === "pro") return null
  const [{ value }] = await db.select({ value: count() }).from(hosts).where(and(eq(hosts.clientId, clientId), eq(hosts.active, true)))
  if (value >= FREE_LIMIT) return { error: "plan_limit" }
  return null
}

// ── Create (redirect variant — used by the /hosts/new page) ─────────
export async function createHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const limited = await checkPlanLimit(session.id, session.plan)
  if (limited) return limited

  const subdomain = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const username = genUsername()
  const password = genPassword()

  await db.insert(hosts).values({
    clientId: session.id, subdomain, description, ttl,
    token: token(), username, passwordHash: await hash(password, 10),
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ── Create (returns result — used by the sheet) ──────────────────────
export async function addHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const limited = await checkPlanLimit(session.id, session.plan)
  if (limited) return limited

  const subdomain = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  const username = genUsername()
  const password = genPassword()

  await db.insert(hosts).values({
    clientId: session.id, subdomain, description, ttl,
    token: token(), username, passwordHash: await hash(password, 10),
  })

  revalidatePath("/dashboard")
  return { ok: true, username, password }
}

// ── Update ──────────────────────────────────────────────────────────
export async function updateHost(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), eq(hosts.clientId, session.id)),
  })
  if (!host) return { error: "Not found" }

  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))
  const active = formData.get("active") === "true"

  await db.update(hosts).set({ description, ttl, active, updatedAt: new Date() }).where(eq(hosts.id, id))

  revalidatePath(`/dashboard/hosts/${id}`)
  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Regenerate token ────────────────────────────────────────────────
export async function regenerateToken(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  await db
    .update(hosts)
    .set({ token: token(), updatedAt: new Date() })
    .where(and(eq(hosts.id, id), eq(hosts.clientId, session.id)))

  revalidatePath(`/dashboard/hosts/${id}`)
}

// ── Regenerate password ─────────────────────────────────────────────
export async function regenerateHostPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const password = genPassword()

  await db
    .update(hosts)
    .set({ passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(and(eq(hosts.id, id), eq(hosts.clientId, session.id)))

  revalidatePath(`/dashboard/hosts/${id}`)
  return { password }
}

// ── Delete (redirect variant — used by the detail page) ─────────────
export async function deleteHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), eq(hosts.clientId, session.id)),
  })

  await db.delete(hosts).where(and(eq(hosts.id, id), eq(hosts.clientId, session.id)))

  if (host?.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
  if (host?.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ── Delete (returns result — used by the sheet) ──────────────────────
export async function removeHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), eq(hosts.clientId, session.id)),
  })

  await db.delete(hosts).where(and(eq(hosts.id, id), eq(hosts.clientId, session.id)))

  if (host?.ipv4) await deleteDnsRecord(host.subdomain, "A",    host.ipv4, host.ttl)
  if (host?.ipv6) await deleteDnsRecord(host.subdomain, "AAAA", host.ipv6, host.ttl)

  revalidatePath("/dashboard")
  return { ok: true }
}

// ── Fetch helpers (used by server components) ───────────────────────
export async function getHosts() {
  const session = await getSession()
  if (!session) redirect("/login")

  return db.query.hosts.findMany({
    where: eq(hosts.clientId, session.id),
    orderBy: (h, { desc }) => [desc(h.createdAt)],
  })
}

export async function getHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  return db.query.hosts.findFirst({
    where: and(eq(hosts.id, id), eq(hosts.clientId, session.id)),
  })
}

export async function getUpdateLog(hostId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, hostId), eq(hosts.clientId, session.id)),
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

  const name        = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null

  if (!name) return { error: "Name is required" }

  const username = genUsername()
  const password = genPassword()

  await db.insert(hostGroups).values({
    clientId: session.id, name, description,
    username, passwordHash: await hash(password, 10),
  })

  revalidatePath("/dashboard/groups")
  return { ok: true, username, password }
}

export async function updateGroup(id: number, formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const group = await db.query.hostGroups.findFirst({
    where: and(eq(hostGroups.id, id), eq(hostGroups.clientId, session.id)),
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

  await db.delete(hostGroups)
    .where(and(eq(hostGroups.id, id), eq(hostGroups.clientId, session.id)))

  revalidatePath("/dashboard/groups")
  return { ok: true }
}

export async function regenerateGroupPassword(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  const password = genPassword()

  await db.update(hostGroups)
    .set({ passwordHash: await hash(password, 10), updatedAt: new Date() })
    .where(and(eq(hostGroups.id, id), eq(hostGroups.clientId, session.id)))

  revalidatePath("/dashboard/groups")
  return { password }
}

export async function getGroups() {
  const session = await getSession()
  if (!session) redirect("/login")

  const groups = await db.query.hostGroups.findMany({
    where: eq(hostGroups.clientId, session.id),
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  })

  // Attach host counts
  const counts = await db
    .select({ groupId: hosts.groupId, value: count() })
    .from(hosts)
    .where(eq(hosts.clientId, session.id))
    .groupBy(hosts.groupId)

  const countMap = new Map(counts.map(c => [c.groupId, c.value]))
  return groups.map(g => ({ ...g, hostCount: countMap.get(g.id) ?? 0 }))
}

export async function getGroupHosts(groupId: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Verify ownership
  const group = await db.query.hostGroups.findFirst({
    where: and(eq(hostGroups.id, groupId), eq(hostGroups.clientId, session.id)),
  })
  if (!group) return []

  return db.query.hosts.findMany({
    where: and(eq(hosts.groupId, groupId), eq(hosts.clientId, session.id)),
    orderBy: (h, { asc }) => [asc(h.subdomain)],
  })
}

export async function assignHostToGroup(hostId: number, groupId: number | null) {
  const session = await getSession()
  if (!session) redirect("/login")

  // Verify host ownership
  const host = await db.query.hosts.findFirst({
    where: and(eq(hosts.id, hostId), eq(hosts.clientId, session.id)),
  })
  if (!host) return { error: "Host not found" }

  // Verify group ownership (if assigning)
  if (groupId !== null) {
    const group = await db.query.hostGroups.findFirst({
      where: and(eq(hostGroups.id, groupId), eq(hostGroups.clientId, session.id)),
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
