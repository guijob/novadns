import { ImageResponse } from "next/og"

export const runtime     = "edge"
export const alt         = "NovaDNS — Free Dynamic DNS"
export const size        = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#09090b",
          position: "relative",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(59,130,246,0.18), transparent)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            backgroundColor: "#3b82f6",
            marginBottom: 36,
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 700, color: "#fff", fontFamily: "sans-serif" }}>
            N
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-2px",
            marginBottom: 16,
            fontFamily: "sans-serif",
          }}
        >
          NovaDNS
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: "#71717a",
            marginBottom: 52,
            fontFamily: "sans-serif",
          }}
        >
          Free Dynamic DNS for Home Servers
        </div>

        {/* Pills row */}
        <div style={{ display: "flex", gap: 12 }}>
          {["IPv4 + IPv6", "DynDNS compatible", "Free plan"].map(label => (
            <div
              key={label}
              style={{
                display: "flex",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "8px 18px",
                color: "#a1a1aa",
                fontSize: 18,
                fontFamily: "sans-serif",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
