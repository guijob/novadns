import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { Logo } from "@/components/logo"
import { ClearStaleCookie } from "./clear-stale-cookie"
import type { WorkspaceContext } from "@/lib/workspace"

function LostSatellite() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto size-48 text-muted-foreground/30"
      aria-hidden="true"
    >
      {/* stars */}
      {[
        [30, 40], [170, 30], [150, 160], [20, 150], [90, 20],
        [60, 170], [180, 90], [40, 90], [130, 50], [160, 130],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={i % 3 === 0 ? 2 : 1.2}
          fill="currentColor"
          opacity={0.4 + (i % 3) * 0.2}
        >
          <animate
            attributeName="opacity"
            values={`${0.3 + (i % 3) * 0.15};${0.7 + (i % 2) * 0.2};${0.3 + (i % 3) * 0.15}`}
            dur={`${2 + (i % 3)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}

      {/* satellite body */}
      <g className="origin-center" style={{ transformBox: "fill-box" }}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="0 100 100"
          values="0 100 100;3 100 100;0 100 100;-3 100 100;0 100 100"
          dur="6s"
          repeatCount="indefinite"
        />

        {/* solar panels */}
        <rect x="38" y="90" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="45" y1="90" x2="45" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="53" y1="90" x2="53" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="61" y1="90" x2="61" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />

        <rect x="132" y="90" width="30" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="139" y1="90" x2="139" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="147" y1="90" x2="147" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <line x1="155" y1="90" x2="155" y2="110" stroke="currentColor" strokeWidth="1" opacity="0.5" />

        {/* panel arms */}
        <line x1="68" y1="100" x2="80" y2="100" stroke="currentColor" strokeWidth="2" />
        <line x1="120" y1="100" x2="132" y2="100" stroke="currentColor" strokeWidth="2" />

        {/* main body */}
        <rect x="80" y="82" width="40" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />

        {/* antenna */}
        <line x1="100" y1="82" x2="100" y2="68" stroke="currentColor" strokeWidth="2" />
        <circle cx="100" cy="65" r="3" stroke="currentColor" strokeWidth="2" fill="none" />

        {/* signal waves — broken/fading */}
        <path d="M88 60 Q84 52 88 44" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="3 3" />
        <path d="M112 60 Q116 52 112 44" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="3 3" />

        {/* "?" on body */}
        <text x="100" y="106" textAnchor="middle" fontSize="18" fontWeight="700" fill="currentColor" opacity="0.6">
          ?
        </text>
      </g>

      {/* orbit ring */}
      <ellipse
        cx="100"
        cy="140"
        rx="60"
        ry="8"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity="0.15"
        strokeDasharray="4 4"
      />
    </svg>
  )
}

const DOT_GRID: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
  backgroundSize: "24px 24px",
}

const GLOW: React.CSSProperties = {
  background: "radial-gradient(ellipse 100% 60% at 50% 100%, oklch(0.59 0.14 242 / 0.28), transparent)",
}

export function WorkspaceNotFound({ workspaces }: { workspaces: WorkspaceContext[] }) {
  const personal = workspaces.find(ws => ws.type === "personal")

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-background overflow-hidden">
      {/* dot grid */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.065]" style={DOT_GRID} />
      {/* bottom glow */}
      <div className="absolute inset-0 pointer-events-none" style={GLOW} />
      <ClearStaleCookie />
      <div className="relative w-full max-w-md space-y-6 text-center">
        <LostSatellite />

        <div className="space-y-2">
          <Logo className="justify-center text-lg" />
          <h1 className="text-2xl font-semibold tracking-tight">Lost in orbit</h1>
          <p className="text-sm text-muted-foreground">
            This workspace doesn&apos;t exist or you no longer have access to it.
          </p>
        </div>

        {workspaces.length > 0 && (
          <div className="space-y-3 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your workspaces</p>
            <div className="divide-y rounded-lg border bg-card">
              {workspaces.map(ws => (
                <Link
                  key={ws.slug}
                  href={`/${ws.slug}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                    <HugeiconsIcon
                      icon={ws.type === "personal" ? UserIcon : UserGroupIcon}
                      strokeWidth={2}
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                  </div>
                  <span className="truncate font-medium">
                    {ws.type === "personal" ? "Personal" : ws.slug}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {personal && (
          <Link
            href={`/${personal.slug}`}
            className="inline-flex h-9 w-full items-center justify-center bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go to dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
