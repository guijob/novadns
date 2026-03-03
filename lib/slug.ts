import { db } from "./db"
import { clients, teams } from "./schema"

export const RESERVED = new Set([
  "api", "dashboard", "login", "register", "logout",
  "pricing", "docs", "compare", "contact", "cookies",
  "forgot-password", "invite", "privacy", "refunds",
  "terms", "reset-password", "settings", "admin", "support",
])

export function generateSlug(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 39) || "user"
  )
}

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 39) return false
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(slug)) return false
  if (RESERVED.has(slug)) return false
  return true
}

export async function findAvailableSlug(
  base: string,
  excludeClientId?: number,
  excludeTeamId?: number,
): Promise<string> {
  const [clientRows, teamRows] = await Promise.all([
    db.select({ id: clients.id, slug: clients.slug }).from(clients),
    db.select({ id: teams.id, slug: teams.slug }).from(teams),
  ])

  const existing = new Set<string>()
  for (const r of clientRows) {
    if (r.slug && r.id !== excludeClientId) existing.add(r.slug)
  }
  for (const r of teamRows) {
    if (r.slug && r.id !== excludeTeamId) existing.add(r.slug)
  }

  const sanitized = generateSlug(base)
  if (sanitized.length >= 3 && !existing.has(sanitized) && !RESERVED.has(sanitized)) {
    return sanitized
  }

  const prefix = sanitized.length >= 3 ? sanitized : "user"
  for (let i = 2; i <= 9999; i++) {
    const candidate = `${prefix.slice(0, 36)}-${i}`
    if (!existing.has(candidate) && !RESERVED.has(candidate)) {
      return candidate
    }
  }

  return `user-${Date.now()}`
}
