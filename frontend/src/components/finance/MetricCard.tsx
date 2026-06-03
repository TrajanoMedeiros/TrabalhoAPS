import type { LucideIcon } from 'lucide-react'

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: 'sky' | 'blue' | 'rose' | 'amber'
}) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700',
    blue: 'bg-blue-50 text-blue-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <article className="summary-card min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-5 break-words text-2xl font-black text-slate-950 sm:text-3xl">{value}</p>
    </article>
  )
}
