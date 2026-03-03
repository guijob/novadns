import { db } from "../lib/db"
import { clients, teams, teamMembers, hosts } from "../lib/schema"
import { eq } from "drizzle-orm"

async function main() {
  const cls = await db.query.clients.findMany({ columns: { id: true, email: true, slug: true, plan: true } })
  const tms = await db.query.teams.findMany({ columns: { id: true, name: true, slug: true, plan: true } })
  const mbs = await db.query.teamMembers.findMany({ where: eq(teamMembers.accepted, true) })
  const allHosts = await db.query.hosts.findMany({ columns: { id: true, clientId: true, teamId: true, subdomain: true } })

  console.log("\n=== CLIENTS ===")
  for (const c of cls) console.log(`  id=${c.id} slug="${c.slug}" email=${c.email} plan=${c.plan}`)

  console.log("\n=== TEAMS ===")
  for (const t of tms) console.log(`  id=${t.id} slug="${t.slug}" name="${t.name}" plan=${t.plan}`)

  console.log("\n=== TEAM MEMBERS (accepted) ===")
  for (const m of mbs) console.log(`  teamId=${m.teamId} clientId=${m.clientId} email=${m.email} role=${m.role}`)

  console.log("\n=== HOSTS ===")
  for (const h of allHosts) console.log(`  id=${h.id} subdomain=${h.subdomain} clientId=${h.clientId} teamId=${h.teamId}`)

  // Check for slug collisions
  const clientSlugs = new Set(cls.map(c => c.slug).filter(Boolean))
  const teamSlugs = tms.map(t => t.slug).filter(Boolean)
  const collisions = teamSlugs.filter(s => clientSlugs.has(s))
  if (collisions.length > 0) {
    console.log("\n⚠️  SLUG COLLISIONS (team slug matches a client slug):", collisions)
  } else {
    console.log("\n✓ No slug collisions")
  }
}

main().catch(console.error).finally(() => process.exit(0))
