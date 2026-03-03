import type { MetadataRoute } from "next"
import { competitors } from "./compare/[slug]/data"

const BASE = "https://novadns.io"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/pricing`,     lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/compare`,     lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/docs`,        lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/privacy`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/cookies`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/refunds`,     lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  const docPages: MetadataRoute.Sitemap = [
    "getting-started",
    "api",
    "ipv6",
    "why-ipv6",
    "webhooks",
    "groups",
    "security",
    "teams",
    "plans",
    "troubleshooting",
    "what-is-ddns",
    "home-server",
    "static-vs-dynamic",
    "dyndns",
    "clients",
    "routers",
  ].map(slug => ({
    url:             `${BASE}/docs/${slug}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }))

  const comparePages: MetadataRoute.Sitemap = competitors.map(c => ({
    url:             `${BASE}/compare/${c.slug}`,
    lastModified:    now,
    changeFrequency: "monthly" as const,
    priority:        0.7,
  }))

  return [...staticPages, ...docPages, ...comparePages]
}
