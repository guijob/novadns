export function Logo({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className ?? ""}`}>
      <span className="font-semibold tracking-tight text-foreground leading-none text-[1.4rem]" aria-label="NovaDNS">
        NovaDNS
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="4 6 50 46"
        fill="none"
        overflow="visible"
        aria-hidden="true"
        className="h-5 w-auto"
      >
        {/* bar below N — overflows the viewBox, visible due to overflow="visible" */}
        <rect x={8} y={56} width={32} height={6} rx={2} fill="var(--color-primary)" />
      </svg>
    </span>
  )
}
