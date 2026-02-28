"use server"

import { randomBytes } from "crypto"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "./db"
import { hosts, updateLog } from "./schema"
import { getSession } from "./auth"

function token() {
  return randomBytes(32).toString("hex")
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
}

// ── Create (redirect variant — used by the /hosts/new page) ─────────
export async function createHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const subdomain = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  await db.insert(hosts).values({ clientId: session.id, subdomain, description, ttl, token: token() })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}

// ── Create (returns result — used by the sheet) ──────────────────────
export async function addHost(formData: FormData) {
  const session = await getSession()
  if (!session) redirect("/login")

  const subdomain = slugify(String(formData.get("subdomain") ?? ""))
  const description = String(formData.get("description") ?? "").trim() || null
  const ttl = Math.max(30, Math.min(86400, Number(formData.get("ttl")) || 60))

  if (!subdomain) return { error: "Invalid subdomain" }

  const exists = await db.query.hosts.findFirst({ where: eq(hosts.subdomain, subdomain) })
  if (exists) return { error: "Subdomain already taken" }

  await db.insert(hosts).values({ clientId: session.id, subdomain, description, ttl, token: token() })

  revalidatePath("/dashboard")
  return { ok: true }
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

// ── Delete ──────────────────────────────────────────────────────────
export async function deleteHost(id: number) {
  const session = await getSession()
  if (!session) redirect("/login")

  await db.delete(hosts).where(and(eq(hosts.id, id), eq(hosts.clientId, session.id)))

  revalidatePath("/dashboard")
  redirect("/dashboard")
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
