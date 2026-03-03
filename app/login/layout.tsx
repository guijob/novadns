import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In — NovaDNS",
  description: "Sign in to NovaDNS to manage your dynamic DNS hosts.",
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
