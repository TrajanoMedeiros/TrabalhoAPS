import { EmptyState } from '../ui'
import type { HistoryItem } from '../../types'
import { formatMoney, monthName } from '../../utils/format'

export function HistoryChart({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return (
      <EmptyState>
        Sem histórico suficiente para o gráfico. Continue registrando movimentações para acompanhar
        tendências mensais.
      </EmptyState>
    )
  }

  const maxValue = Math.max(
    1,
    ...history.map((item) => Math.max(item.total_receitas, item.total_despesas)),
  )

  return (
    <div className="grid gap-4">
      {history.map((item) => (
        <div key={`${item.mes}-${item.ano}`} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-extrabold text-slate-700">
              {monthName(item.mes)} {item.ano}
            </span>
            <span className="font-bold text-slate-500">{formatMoney(item.saldo)}</span>
          </div>
          <div className="grid gap-1">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sky-600"
                style={{ width: `${(item.total_receitas / maxValue) * 100}%` }}
              />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${(item.total_despesas / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
