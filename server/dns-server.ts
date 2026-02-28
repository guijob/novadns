import "dotenv/config"
import DNS from "dns2"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq, and } from "drizzle-orm"
import * as schema from "../lib/schema"

const { Packet } = DNS

const sql = neon(process.env.DATABASE_URL!)
const db  = drizzle(sql, { schema })

const BASE_DOMAIN = process.env.BASE_DOMAIN ?? "novadns.io"

// Build a reverse map: numeric type -> string name (e.g. 1 -> "A")
const TYPE_BY_NUMBER: Record<number, string> = Object.fromEntries(
  Object.entries(Packet.TYPE).map(([k, v]) => [v, k])
)

const RCODE_NXDOMAIN = 3
const RCODE_SERVFAIL = 2

async function resolve(qname: string, qtypeNum: number) {
  const name = qname.replace(/\.$/, "").toLowerCase()
  const qtype = TYPE_BY_NUMBER[qtypeNum]

  // Only handle our base domain
  if (!name.endsWith("." + BASE_DOMAIN) && name !== BASE_DOMAIN) return null

  const subdomain = name === BASE_DOMAIN
    ? "@"
    : name.slice(0, -(BASE_DOMAIN.length + 1))

  const host = await db.query.hosts.findFirst({
    where: and(
      eq(schema.hosts.subdomain, subdomain),
      eq(schema.hosts.active, true),
    ),
  })

  if (!host) return null

  if (qtype === "A" && host.ipv4)   return { type: qtypeNum, address: host.ipv4,   ttl: host.ttl }
  if (qtype === "AAAA" && host.ipv6) return { type: qtypeNum, address: host.ipv6, ttl: host.ttl }

  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPacket = any

const server = DNS.createServer({
  udp: true,
  tcp: true,
  handle: async (request, send) => {
    const response = Packet.createResponseFromRequest(request) as AnyPacket
    response.header.aa = 1

    for (const question of (request as AnyPacket).questions as AnyPacket[]) {
      try {
        const hit = await resolve(question.name as string, question.type as number)

        if (hit) {
          response.answers.push({
            name:    question.name,
            type:    hit.type,
            class:   Packet.CLASS.IN,
            ttl:     hit.ttl,
            address: hit.address,
          })
        } else {
          response.header.rcode = RCODE_NXDOMAIN
        }
      } catch (err) {
        console.error("DNS resolve error:", err)
        response.header.rcode = RCODE_SERVFAIL
      }
    }

    send(response)
  },
})

const PORT = parseInt(process.env.DNS_PORT ?? "5454")

server.listen({ udp: PORT, tcp: PORT })
console.log(`NovaDNS listening on port ${PORT} (UDP + TCP) — serving *.${BASE_DOMAIN}`)
