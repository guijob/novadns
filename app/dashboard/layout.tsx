import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { clients } from "@/lib/schema"
import { eq } from "drizzle-orm"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const client = await db.query.clients.findFirst({
    where: eq(clients.id, session.id),
    columns: { slug: true },
  })

  redirect(`/${client?.slug ?? session.id}`)
}
