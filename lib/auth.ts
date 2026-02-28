import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { db } from "./db"
import { clients } from "./schema"
import { eq } from "drizzle-orm"

const COOKIE = "nova_session"
const secret = () => new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signToken(clientId: number) {
  return new SignJWT({ sub: String(clientId) })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret())
    return Number(payload.sub)
  } catch {
    return null
  }
}

export async function getSession() {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return null
  const clientId = await verifyToken(token)
  if (!clientId) return null
  return db.query.clients.findFirst({ where: eq(clients.id, clientId) })
}

export async function setSessionCookie(clientId: number) {
  const token = await signToken(clientId)
  const jar = await cookies()
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.delete(COOKIE)
}
