export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 92 58"
      fill="none"
      aria-label="NovaDNS"
      className={className}
    >
      <g stroke="currentColor" strokeWidth={8} strokeLinecap="butt">
        <line x1={12} y1={10} x2={12} y2={48} />
        <line x1={12} y1={10} x2={46} y2={48} />
        <line x1={46} y1={10} x2={46} y2={48} />
      </g>
      <rect x={60} y={44} width={24} height={5} rx={1} fill="var(--color-primary)" />
    </svg>
  )
}
