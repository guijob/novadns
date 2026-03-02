export type FeatureValue = true | false | "partial" | string

export interface Feature {
  label: string
  nova: FeatureValue
  them: FeatureValue
  note?: string
}

export interface Competitor {
  slug:        string
  name:        string
  tagline:     string
  summary:     string
  verdict:     string
  features:    Feature[]
  sections:    { title: string; body: string }[]
}

const novaBase: Omit<Feature, "them" | "note">[] = [
  { label: "Free tier",               nova: true  },
  { label: "Hosts on free plan",      nova: "3 hosts" },
  { label: "IPv4 (A records)",        nova: true  },
  { label: "IPv6 (AAAA records)",     nova: true  },
  { label: "Dual-stack simultaneously", nova: true },
  { label: "Per-host token auth",     nova: true  },
  { label: "DynDNS / NoIP compatible", nova: true },
  { label: "Update log & audit trail", nova: true },
  { label: "Custom TTL",              nova: "Paid plans" },
  { label: "Host groups",             nova: "Paid plans" },
  { label: "Webhook notifications",   nova: true  },
  { label: "Modern dashboard",        nova: true  },
  { label: "No confirmation emails",  nova: true  },
  { label: "No ads",                  nova: true  },
]

export const competitors: Competitor[] = [
  {
    slug:    "noip",
    name:    "No-IP",
    tagline: "NovaDNS vs No-IP",
    summary: "No-IP is one of the oldest and most recognised DDNS providers, with a large free tier — but it comes with a catch: free hostnames expire every 30 days unless you manually confirm them. NovaDNS never expires your hosts.",
    verdict: "No-IP is a solid legacy choice, but the monthly confirmation requirement is a recurring pain point that has caught countless users off-guard. NovaDNS gives you a cleaner experience with token-based auth, a modern dashboard, and hosts that stay active without reminders.",
    features: novaBase.map(f => {
      const map: Record<string, { them: FeatureValue; note?: string }> = {
        "Free tier":               { them: true  },
        "Hosts on free plan":      { them: "3 hostnames", note: "Must confirm every 30 days or they expire" },
        "IPv4 (A records)":        { them: true  },
        "IPv6 (AAAA records)":     { them: "partial", note: "Available but requires separate setup" },
        "Dual-stack simultaneously": { them: "partial" },
        "Per-host token auth":     { them: false, note: "Username/password only" },
        "DynDNS / NoIP compatible": { them: true },
        "Update log & audit trail": { them: "partial", note: "Limited history" },
        "Custom TTL":              { them: "Paid only" },
        "Host groups":             { them: false },
        "Webhook notifications":   { them: false },
        "Modern dashboard":        { them: "partial", note: "Functional but dated UI" },
        "No confirmation emails":  { them: false, note: "Monthly confirmation required on free" },
        "No ads":                  { them: false, note: "Ads shown on free plan" },
      }
      return { ...f, ...map[f.label] }
    }),
    sections: [
      {
        title: "The 30-day confirmation problem",
        body:  "No-IP's most criticised feature is its free hostname expiration policy. Every 30 days, free-tier users must click a confirmation email or their hostnames are deactivated. This is designed to push users to paid plans, but it creates real operational risk — if you miss the email, your home server, NAS, or security camera goes offline silently. NovaDNS hosts never expire.",
      },
      {
        title: "Authentication model",
        body:  "No-IP uses a shared username and password for updates. This means every device on your account uses the same credentials, and rotating them affects everything at once. NovaDNS generates a unique 64-character token per host — rotating one host's token has zero impact on others.",
      },
      {
        title: "IPv6 support",
        body:  "Both services support IPv6, but NovaDNS maintains A and AAAA records simultaneously without any extra configuration. Every host is dual-stack by default. On No-IP, IPv6 setup requires additional steps and isn't available on all account types.",
      },
      {
        title: "Pricing",
        body:  "No-IP's paid plans start at $3.99/month for 5 hostnames, rising to $9.99/month for enhanced features. NovaDNS paid plans start at $5/month with 25 hosts, significantly better value per hostname at scale.",
      },
    ],
  },
  {
    slug:    "dyndns",
    name:    "DynDNS",
    tagline: "NovaDNS vs DynDNS",
    summary: "DynDNS invented the dynamic DNS protocol in the 1990s. After being acquired by Oracle/Dyn, it became an enterprise product with no free tier and pricing aimed at large organisations. It is no longer a practical option for individuals or small businesses.",
    verdict: "DynDNS is a historical giant that priced itself out of the market it created. If you were a DynDNS user forced to migrate, NovaDNS offers the same protocol compatibility, a modern interface, and plans that are actually accessible.",
    features: novaBase.map(f => {
      const map: Record<string, { them: FeatureValue; note?: string }> = {
        "Free tier":               { them: false, note: "Free tier discontinued in 2014" },
        "Hosts on free plan":      { them: "None" },
        "IPv4 (A records)":        { them: true  },
        "IPv6 (AAAA records)":     { them: "partial", note: "Enterprise plans only" },
        "Dual-stack simultaneously": { them: "partial" },
        "Per-host token auth":     { them: false },
        "DynDNS / NoIP compatible": { them: true, note: "They created the protocol" },
        "Update log & audit trail": { them: "partial" },
        "Custom TTL":              { them: true },
        "Host groups":             { them: "partial" },
        "Webhook notifications":   { them: false },
        "Modern dashboard":        { them: false, note: "Enterprise portal, not consumer-friendly" },
        "No confirmation emails":  { them: true },
        "No ads":                  { them: true },
      }
      return { ...f, ...map[f.label] }
    }),
    sections: [
      {
        title: "The end of free DynDNS",
        body:  "In May 2014, Dyn (now Oracle) shut down its free dynamic DNS service, leaving millions of users scrambling for alternatives overnight. Today DynDNS is exclusively an enterprise product with pricing that reflects that — think hundreds to thousands of dollars per year, not $5/month.",
      },
      {
        title: "Protocol compatibility",
        body:  "The DynDNS update protocol is the industry standard that virtually every router and firmware supports. NovaDNS is fully compatible with this protocol — you can point any device that was previously configured for DynDNS at NovaDNS by changing the server hostname. No client software changes required.",
      },
      {
        title: "Who is DynDNS for today?",
        body:  "Post-acquisition, DynDNS is aimed at large enterprises that need managed DNS infrastructure at scale. If you are an individual, home lab enthusiast, or small business, DynDNS is not the right tool. NovaDNS was built specifically for that audience.",
      },
    ],
  },
  {
    slug:    "duckdns",
    name:    "Duck DNS",
    tagline: "NovaDNS vs Duck DNS",
    summary: "Duck DNS is a beloved free-only DDNS service run by volunteers. It is simple, reliable, and costs nothing — but it offers no paid tiers, no DynDNS compatibility, no update history, and a minimal interface that has barely changed in years.",
    verdict: "Duck DNS is excellent for a quick free setup with minimal requirements. If you need DynDNS protocol compatibility, an update log, webhooks, or more than 5 subdomains, NovaDNS is a natural upgrade path.",
    features: novaBase.map(f => {
      const map: Record<string, { them: FeatureValue; note?: string }> = {
        "Free tier":               { them: true  },
        "Hosts on free plan":      { them: "5 subdomains" },
        "IPv4 (A records)":        { them: true  },
        "IPv6 (AAAA records)":     { them: true  },
        "Dual-stack simultaneously": { them: true },
        "Per-host token auth":     { them: true, note: "Single account token, not per-host" },
        "DynDNS / NoIP compatible": { them: false, note: "Uses its own simple API only" },
        "Update log & audit trail": { them: false },
        "Custom TTL":              { them: false, note: "Fixed 60s TTL" },
        "Host groups":             { them: false },
        "Webhook notifications":   { them: false },
        "Modern dashboard":        { them: false, note: "Very minimal interface" },
        "No confirmation emails":  { them: true },
        "No ads":                  { them: true },
      }
      return { ...f, ...map[f.label] }
    }),
    sections: [
      {
        title: "Protocol compatibility",
        body:  "Duck DNS uses its own simple HTTP API rather than the DynDNS protocol. This means most routers, NAS devices, and firmware that have built-in DDNS support cannot use Duck DNS without a custom script. NovaDNS implements the DynDNS and NoIP protocols, so it works with any device that supports those providers out of the box.",
      },
      {
        title: "Simplicity vs features",
        body:  "Duck DNS is intentionally minimal — there is almost no configuration, no dashboard to speak of, and no paid tiers. This is a feature for users who want zero friction. But for users who want update history, custom TTLs, webhook notifications, or organised host groups, there is simply nothing to configure.",
      },
      {
        title: "Token model",
        body:  "Duck DNS issues one token per account, shared across all your subdomains. NovaDNS issues a unique token per host, so each device has independent credentials. Compromising one token does not affect your other hosts.",
      },
      {
        title: "Sustainability",
        body:  "Duck DNS is run by volunteers with no revenue model. It has been reliable for years, but there is inherent risk in depending on volunteer infrastructure for production use. NovaDNS is a commercial product with a clear business model.",
      },
    ],
  },
  {
    slug:    "dynu",
    name:    "Dynu",
    tagline: "NovaDNS vs Dynu",
    summary: "Dynu offers a generous free tier with unlimited hostnames and solid DynDNS compatibility. However, its interface is dated, its authentication model relies on shared account credentials, and its IPv6 support requires manual configuration.",
    verdict: "Dynu is one of the more capable free DDNS options. The unlimited hostname count is genuinely useful. Where NovaDNS pulls ahead is in security (per-host tokens), ease of use, webhook support, and a significantly more modern interface.",
    features: novaBase.map(f => {
      const map: Record<string, { them: FeatureValue; note?: string }> = {
        "Free tier":               { them: true  },
        "Hosts on free plan":      { them: "Unlimited" },
        "IPv4 (A records)":        { them: true  },
        "IPv6 (AAAA records)":     { them: true  },
        "Dual-stack simultaneously": { them: "partial", note: "Requires separate configuration" },
        "Per-host token auth":     { them: false, note: "API key shared across all hosts" },
        "DynDNS / NoIP compatible": { them: true },
        "Update log & audit trail": { them: "partial", note: "Basic log available" },
        "Custom TTL":              { them: true },
        "Host groups":             { them: false },
        "Webhook notifications":   { them: false },
        "Modern dashboard":        { them: false, note: "Functional but dated UI" },
        "No confirmation emails":  { them: true },
        "No ads":                  { them: true },
      }
      return { ...f, ...map[f.label] }
    }),
    sections: [
      {
        title: "Unlimited free hosts",
        body:  "Dynu's unlimited free hostname count is its standout feature. If you manage dozens of devices and cost is the primary concern, Dynu's free tier is hard to beat on that dimension alone. NovaDNS's free plan caps at 3 hosts, with paid plans starting at 25.",
      },
      {
        title: "Security model",
        body:  "Dynu uses a single API key or account password for all updates. This creates a security risk: if a device is compromised, an attacker can update any of your hostnames. NovaDNS's per-host token model means each device has a completely isolated credential — one compromised device cannot affect any other.",
      },
      {
        title: "Interface and experience",
        body:  "Dynu's dashboard is functional and has a lot of configuration options, but the interface design has not changed substantially in years. For users who find older UIs confusing, NovaDNS's dashboard was designed from the ground up for clarity.",
      },
      {
        title: "Webhook and integrations",
        body:  "NovaDNS supports webhooks — outbound HTTP callbacks triggered when a host's IP changes. This is useful for automation: updating firewall rules, triggering deployments, or alerting monitoring systems. Dynu has no equivalent feature.",
      },
    ],
  },
  {
    slug:    "afraid",
    name:    "FreeDNS",
    tagline: "NovaDNS vs FreeDNS (afraid.org)",
    summary: "FreeDNS by afraid.org is a long-running community DNS service offering free subdomains on hundreds of shared domain names. It is a technical product for experienced users, with a very dated interface and a model built around shared community domains rather than dedicated DDNS hostnames.",
    verdict: "FreeDNS is a powerful tool for technically experienced users who want maximum flexibility with community domains. For users who want a dedicated hostname under a clean domain, a modern interface, and reliable DDNS with DynDNS compatibility, NovaDNS is a cleaner fit.",
    features: novaBase.map(f => {
      const map: Record<string, { them: FeatureValue; note?: string }> = {
        "Free tier":               { them: true  },
        "Hosts on free plan":      { them: "Unlimited", note: "On community-shared domains" },
        "IPv4 (A records)":        { them: true  },
        "IPv6 (AAAA records)":     { them: true  },
        "Dual-stack simultaneously": { them: "partial" },
        "Per-host token auth":     { them: false, note: "Account-level token" },
        "DynDNS / NoIP compatible": { them: "partial", note: "Partial compatibility" },
        "Update log & audit trail": { them: false },
        "Custom TTL":              { them: true },
        "Host groups":             { them: false },
        "Webhook notifications":   { them: false },
        "Modern dashboard":        { them: false, note: "Very dated interface" },
        "No confirmation emails":  { them: true },
        "No ads":                  { them: "partial", note: "Minimal ads" },
      }
      return { ...f, ...map[f.label] }
    }),
    sections: [
      {
        title: "Community domains vs dedicated hostnames",
        body:  "FreeDNS operates on shared domains — you pick a subdomain under one of hundreds of community-owned domains (like mooo.com, afraid.org, etc.). This is free and flexible, but the domain names are not professional-looking and can be claimed by anyone. NovaDNS hosts are always under novadns.io, a clean dedicated domain.",
      },
      {
        title: "Interface and learning curve",
        body:  "FreeDNS was built in the early 2000s and the interface reflects that era. Managing records requires navigating a complex web of menus that can be confusing even for experienced users. NovaDNS was built with a modern UI/UX as a core design goal.",
      },
      {
        title: "DynDNS compatibility",
        body:  "FreeDNS has partial DynDNS protocol support, but not all clients work reliably with it. NovaDNS implements the protocol fully — any router, firmware, or client that supports DynDNS or NoIP will work with NovaDNS without modification.",
      },
      {
        title: "Reliability and uptime",
        body:  "FreeDNS is community infrastructure running on volunteer effort. While it has a long track record, it has experienced notable outages over the years. NovaDNS is commercial infrastructure with uptime as a core service commitment.",
      },
    ],
  },
]

export function getCompetitor(slug: string) {
  return competitors.find(c => c.slug === slug)
}
