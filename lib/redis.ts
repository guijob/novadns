import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/** Key that signals a host list change for a given client. TTL = 90s. */
export function hostUpdateKey(clientId: number) {
  return `hosts:updated:${clientId}`
}

/**
 * Sliding-window rate limiter using a Redis counter + TTL.
 * Returns true if the request is allowed, false if the limit is exceeded.
 *
 * @param key    - unique identifier (e.g. "rl:host:42" or "rl:ip:1.2.3.4")
 * @param limit  - max requests allowed in the window
 * @param window - window size in seconds
 */
export async function rateLimit(key: string, limit: number, window: number): Promise<boolean> {
  try {
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, window) // set TTL on first request
    return count <= limit
  } catch {
    return true // fail open — don't block updates if Redis is down
  }
}
