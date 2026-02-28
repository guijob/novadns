import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/** Key that signals a host list change for a given client. TTL = 90s. */
export function hostUpdateKey(clientId: number) {
  return `hosts:updated:${clientId}`
}
