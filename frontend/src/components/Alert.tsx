import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export function Alert({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'success' | 'error'
  icon: LucideIcon
  children: ReactNode
}) {
  const classes =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-rose-200 bg-rose-50 text-rose-900'

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${classes}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
