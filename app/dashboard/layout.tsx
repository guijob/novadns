import { redirect } from "next/navigation"
import { eq, and, count } from "drizzle-orm"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { hosts } from "@/lib/schema"
import { DashboardShell } from "@/components/sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const [{ value: activeCount }] = await db
    .select({ value: count() })
    .from(hosts)
    .where(and(eq(hosts.clientId, session.id), eq(hosts.active, true)))

  return (
    <DashboardShell email={session.email} plan={session.plan} activeCount={activeCount}>
      {children}
    </DashboardShell>
  )
}
