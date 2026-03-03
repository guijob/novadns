import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Create Account — NovaDNS",
  description: "Create a free NovaDNS account. No credit card required.",
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
