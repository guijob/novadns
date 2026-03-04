import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CGNAT Checker — Am I Behind Carrier-Grade NAT? | NovaDNS",
  description:
    "Instantly check if your ISP is using Carrier-Grade NAT (CGNAT). Find out if your home server or self-hosted services can be reached from the internet.",
  openGraph: {
    title: "CGNAT Checker — Am I Behind Carrier-Grade NAT?",
    description:
      "Instantly check if your ISP is using Carrier-Grade NAT (CGNAT). Find out if your home server or self-hosted services can be reached from the internet.",
    type: "website",
    url: "https://novadns.io/tools/cgnat",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
