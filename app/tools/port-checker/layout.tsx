import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Port Checker — Test If a Port Is Open From the Internet | NovaDNS",
  description:
    "Check if a port on your home IP is reachable from the internet. Test port forwarding, firewall rules, and verify your home server is publicly accessible.",
  openGraph: {
    title: "Port Checker — Test If a Port Is Open From the Internet",
    description:
      "Check if a port on your home IP is reachable from the internet. Test port forwarding, firewall rules, and verify your home server is publicly accessible.",
    type: "website",
    url: "https://novadns.io/tools/port-checker",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
