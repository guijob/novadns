// Server Component

interface CodeBlockProps {
  filename?: string
  label?: string
  children: React.ReactNode
}

export function CodeBlock({ filename, label, children }: CodeBlockProps) {
  return (
    <div className="border border-border my-5 overflow-hidden">
      {(filename || label) && (
        <div className="border-b border-border px-4 py-2 flex items-center justify-between bg-muted/30">
          <span className="text-xs font-mono text-muted-foreground">{filename}</span>
          {label && (
            <span className="text-xs font-mono text-muted-foreground/60">{label}</span>
          )}
        </div>
      )}
      <div className="bg-zinc-950 p-4 overflow-x-auto">
        <pre className="font-mono text-xs leading-[1.7]">{children}</pre>
      </div>
    </div>
  )
}

// Token colours — compose these in each page
export const c = {
  dim:     (t: string) => <span className="text-slate-500">{t}</span>,
  str:     (t: string) => <span className="text-amber-300">{t}</span>,
  key:     (t: string) => <span className="text-sky-400">{t}</span>,
  out:     (t: string) => <span className="text-emerald-400">{t}</span>,
  kw:      (t: string) => <span className="text-violet-300">{t}</span>,
  url:     (t: string) => <span className="text-blue-300">{t}</span>,
  plain:   (t: string) => <span className="text-slate-200">{t}</span>,
  prompt:  (t: string) => <span className="text-emerald-400">{t}</span>,
  flag:    (t: string) => <span className="text-slate-400">{t}</span>,
}
