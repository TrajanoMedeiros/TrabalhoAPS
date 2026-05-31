import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from 'lucide-react'
import { Button, EmptyState } from '../ui'
import type { SavingAction, TransactionWithKind } from '../../types'
import { formatDate, formatMoney } from '../../utils/format'

export function TransactionList({
  transactions,
  saving,
  onDelete,
  onEdit,
  compact = false,
}: {
  transactions: TransactionWithKind[]
  saving: SavingAction
  onDelete: (transaction: TransactionWithKind) => void
  onEdit?: (transaction: TransactionWithKind) => void
  compact?: boolean
}) {
  if (transactions.length === 0) {
    return <EmptyState>Nenhum lancamento no periodo.</EmptyState>
  }

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.kind === 'income'
        return (
          <article
            key={`${transaction.kind}-${transaction.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border-b border-slate-100 p-2 transition duration-200 last:border-0 hover:bg-slate-50"
          >
            <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                  isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isIncome ? (
                  <ArrowUpCircle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">
                  {transaction.descricao || transaction.categoria_nome || transaction.tipo}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {transaction.categoria_nome ?? 'Sem categoria'} | {formatDate(transaction.data)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p
                className={`text-right font-black ${
                  isIncome ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatMoney(transaction.valor)}
              </p>
              {!compact && (
                <>
                  {onEdit && (
                    <Button
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                      disabled={saving === 'transaction'}
                      className="min-h-10 px-3"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Editar</span>
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    onClick={() => onDelete(transaction)}
                    disabled={saving === 'delete'}
                    className="min-h-10 px-3"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Remover</span>
                  </Button>
                </>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}
