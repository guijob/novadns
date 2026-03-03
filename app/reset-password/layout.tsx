import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password — NovaDNS",
  description: "Set a new password for your NovaDNS account.",
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
