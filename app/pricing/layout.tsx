import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing — NovaDNS",
  description: "Free plan with 3 hosts, no credit card required. Upgrade to Starter, Pro, Business, or Enterprise as you grow. Cancel any time.",
  openGraph: {
    title: "Pricing — NovaDNS",
    description: "Free plan with 3 hosts, no credit card required. Upgrade to Starter, Pro, Business, or Enterprise as you grow. Cancel any time.",
    type: "website",
    url: "https://novadns.io/pricing",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
