import { EmptyState } from '../ui'
import { formatMoney } from '../../utils/format'

export function BarList({
  items,
  tone,
}: {
  items: Array<{ categoria: string; total: number }>
  tone: 'emerald' | 'rose'
}) {
  if (items.length === 0) {
    return (
      <EmptyState>
        Sem dados para este periodo. Registre novos lancamentos para revelar a distribuicao por
        categoria.
      </EmptyState>
    )
  }

  const maxValue = Math.max(1, ...items.map((item) => item.total))
  const color = tone === 'emerald' ? 'bg-sky-600' : 'bg-rose-500'

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.categoria} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-extrabold text-slate-700">{item.categoria}</span>
            <span className="font-bold text-slate-500">{formatMoney(item.total)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(item.total / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
