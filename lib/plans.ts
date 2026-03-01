export type PlanKey = "free" | "starter" | "pro" | "business" | "enterprise"

export const PLANS: Record<PlanKey, {
  limit:        number
  monthlyPrice: number
  label:        string
  stripeEnvKey: string | null
}> = {
  free:       { limit: 3,   monthlyPrice: 0,  label: "Free",       stripeEnvKey: null                       },
  starter:    { limit: 25,  monthlyPrice: 5,  label: "Starter",    stripeEnvKey: "STRIPE_PRICE_STARTER"     },
  pro:        { limit: 100, monthlyPrice: 15, label: "Pro",        stripeEnvKey: "STRIPE_PRICE_PRO"         },
  business:   { limit: 200, monthlyPrice: 25, label: "Business",   stripeEnvKey: "STRIPE_PRICE_BUSINESS"    },
  enterprise: { limit: 500, monthlyPrice: 50, label: "Enterprise", stripeEnvKey: "STRIPE_PRICE_ENTERPRISE"  },
}

export const PAID_PLANS = (["starter", "pro", "business", "enterprise"] as const) satisfies readonly PlanKey[]

export function getPlanLimit(plan: string): number {
  return PLANS[plan as PlanKey]?.limit ?? PLANS.free.limit
}

export function isPaidPlan(plan: string): plan is Exclude<PlanKey, "free"> {
  return plan !== "free" && plan in PLANS
}

/** Pro, Business, Enterprise can set custom usernames/passwords */
export function canCustomizeCredentials(plan: string): boolean {
  return plan === "pro" || plan === "business" || plan === "enterprise"
}

export function getPriceId(plan: PlanKey): string {
  const { stripeEnvKey } = PLANS[plan]
  if (!stripeEnvKey) throw new Error("Free plan has no Stripe price")
  const id = process.env[stripeEnvKey]
  if (!id) throw new Error(`Missing env var ${stripeEnvKey}`)
  return id
}

export function getPlanByPriceId(priceId: string): PlanKey | null {
  for (const [key, val] of Object.entries(PLANS)) {
    if (val.stripeEnvKey && process.env[val.stripeEnvKey] === priceId) {
      return key as PlanKey
    }
  }
  return null
}
