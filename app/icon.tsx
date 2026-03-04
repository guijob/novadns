import { ImageResponse } from "next/og"

export const size        = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div style={{ display: "flex", width: 512, height: 512, background: "#0f172a" }}>
      <svg width="512" height="512" viewBox="0 0 512 512">
        {/* White N */}
        <g stroke="white" strokeWidth="48" strokeLinecap="butt" fill="none">
          <line x1="176" y1="120" x2="176" y2="320" />
          <line x1="176" y1="120" x2="336" y2="320" />
          <line x1="336" y1="120" x2="336" y2="320" />
        </g>
        {/* Primary accent bar below the N */}
        <rect x="80" y="404" width="332" height="56" rx="4" fill="#4068c8" />
      </svg>
    </div>,
    { width: 512, height: 512 },
  )
}
