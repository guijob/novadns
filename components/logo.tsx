export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 88 56"
      fill="none"
      aria-label="NovaDNS"
      className={className}
    >
      <g stroke="currentColor" strokeWidth={8} strokeLinecap="butt">
        <line x1={8}  y1={8} x2={8}  y2={48} />
        <line x1={8}  y1={8} x2={40} y2={48} />
        <line x1={40} y1={8} x2={40} y2={48} />
      </g>
      <rect x={54} y={44} width={26} height={6} rx={1} fill="var(--color-primary)" />
    </svg>
  )
}
