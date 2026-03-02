"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

const faqs = [
  {
    q: "Is NovaDNS compatible with my router or NAS?",
    a: "Yes. NovaDNS implements the DynDNS and NoIP update protocols verbatim, so it works with any device or firmware that supports those providers — including Synology DSM, pfSense, OPNsense, OpenWrt, ASUS, TP-Link, UniFi, and more. No custom client needed.",
  },
  {
    q: "What is IPv6 subnet support?",
    a: "Many ISPs assign a dynamic IPv6 prefix block (e.g. 2001:db8:1234::/48) to your router rather than a single static address. NovaDNS can track that entire prefix under one hostname, so all devices inside your network remain reachable even as the prefix changes.",
  },
  {
    q: "How does the update API work?",
    a: "Send a GET or POST to https://novadns.io/api/update?token=YOUR_TOKEN. NovaDNS detects your public IP from the request and updates both A and AAAA records. You can also pass explicit IPs via the myip parameter, or use the DynDNS-compatible /nic/update endpoint with basic auth.",
  },
  {
    q: "What is the difference between Free and Pro?",
    a: "The Free plan covers 3 active hosts — more than enough for a home lab. Paid plans start at $5/mo for 25 hosts and scale up to 500 hosts at $50/mo. All paid plans include custom TTL, IPv6 subnet tracking, and priority support.",
  },
  {
    q: "Can I rotate my update token?",
    a: "Yes. Open the host settings in your dashboard and click Regenerate Token. The old token is invalidated immediately. Your device will start failing updates until you enter the new token — by design, so you stay in control.",
  },
]

export function LandingFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="max-w-3xl divide-y divide-border">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            className="w-full py-5 flex items-start justify-between gap-4 text-left cursor-pointer"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
          >
            <span className="font-medium leading-snug">{faq.q}</span>
            <span
              className="text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200"
              style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="size-4" />
            </span>
          </button>
          {openFaq === i && (
            <div className="pb-5 text-sm text-muted-foreground leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
