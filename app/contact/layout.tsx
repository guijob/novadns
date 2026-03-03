import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact — NovaDNS",
  description: "Get in touch with the NovaDNS team. We respond within one business day.",
  openGraph: {
    title: "Contact — NovaDNS",
    description: "Get in touch with the NovaDNS team. We respond within one business day.",
    type: "website",
    url: "https://novadns.io/contact",
    siteName: "NovaDNS",
    images: [{ url: "https://novadns.io/opengraph-image" }],
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
