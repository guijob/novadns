import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Forgot Password — NovaDNS",
  description: "Reset your NovaDNS account password.",
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
