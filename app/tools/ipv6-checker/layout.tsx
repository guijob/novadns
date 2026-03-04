import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "IPv6 Test — Do I Have IPv6 Connectivity? | NovaDNS",
  description:
    "Check if your internet connection supports IPv6. See your IPv6 address, understand what it means for your home server, and learn how NovaDNS handles dual-stack DNS.",
  openGraph: {
    title: "IPv6 Test — Do I Have IPv6 Connectivity?",
    description:
      "Check if your internet connection supports IPv6. See your IPv6 address, understand what it means for your home server, and learn how NovaDNS handles dual-stack DNS.",
    type: "website",
    url: "https://novadns.io/tools/ipv6-checker",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
