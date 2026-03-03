/**
 * One-time backfill script: assign slugs to all clients and teams that don't have one.
 * Run with: npx tsx scripts/backfill-slugs.ts
 */

import { db } from "../lib/db"
import { clients, teams } from "../lib/schema"
import { isNull, eq } from "drizzle-orm"
import { generateSlug, findAvailableSlug } from "../lib/slug"

async function main() {
  console.log("Starting slug backfill...")

  // Backfill clients
  const clientsWithoutSlug = await db.query.clients.findMany({
    where: isNull(clients.slug),
  })
  console.log(`Found ${clientsWithoutSlug.length} clients without slugs`)

  for (const client of clientsWithoutSlug) {
    const base = generateSlug(client.email.split("@")[0])
    const slug = await findAvailableSlug(base, client.id)
    await db.update(clients).set({ slug }).where(eq(clients.id, client.id))
    console.log(`  client ${client.id} (${client.email}) → ${slug}`)
  }

  // Backfill teams
  const teamsWithoutSlug = await db.query.teams.findMany({
    where: isNull(teams.slug),
  })
  console.log(`Found ${teamsWithoutSlug.length} teams without slugs`)

  for (const team of teamsWithoutSlug) {
    const base = generateSlug(team.name)
    const slug = await findAvailableSlug(base, undefined, team.id)
    await db.update(teams).set({ slug }).where(eq(teams.id, team.id))
    console.log(`  team ${team.id} (${team.name}) → ${slug}`)
  }

  console.log("Done.")
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
