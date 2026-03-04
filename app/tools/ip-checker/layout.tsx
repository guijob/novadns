import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "What Is My IP Address? — IPv4 & IPv6 Checker | NovaDNS",
  description:
    "Instantly see your public IP address. Find out if you have IPv4, IPv6, or both — and whether your IP is dynamic or behind CGNAT.",
  openGraph: {
    title: "What Is My IP Address? — IPv4 & IPv6 Checker",
    description:
      "Instantly see your public IP address. Find out if you have IPv4, IPv6, or both — and whether your IP is dynamic or behind CGNAT.",
    type: "website",
    url: "https://novadns.io/tools/ip-checker",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
