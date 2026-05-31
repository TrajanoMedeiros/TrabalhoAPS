import { useMemo, useState, type FormEvent } from 'react'
import { ArrowDownCircle, ArrowUpCircle, CircleX, Loader2, Plus, Search } from 'lucide-react'
import { DateInput } from '../components/form/DateInput'
import { SelectInput } from '../components/form/SelectInput'
import { TransactionList } from '../components/finance/TransactionList'
import { Button, Field, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { Category, SavingAction, TransactionForm, TransactionWithKind } from '../types'

export function TransactionsPage({
  transactionForm,
  categories,
  transactions,
  editingTransaction,
  saving,
  onTransactionFormChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onDelete,
}: {
  transactionForm: TransactionForm
  categories: Category[]
  transactions: TransactionWithKind[]
  editingTransaction: TransactionWithKind | null
  saving: SavingAction
  onTransactionFormChange: (value: TransactionForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEdit: (transaction: TransactionWithKind) => void
  onCancelEdit: () => void
  onDelete: (transaction: TransactionWithKind) => void
}) {
  const [query, setQuery] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | 'income' | 'expense'>('all')
  const isEditing = editingTransaction !== null

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return transactions.filter((transaction) => {
      if (kindFilter !== 'all' && transaction.kind !== kindFilter) return false
      if (!normalizedQuery) return true

      const searchable = [
        transaction.descricao ?? '',
        transaction.categoria_nome ?? '',
        transaction.tipo,
        transaction.data,
        transaction.valor.toFixed(2),
      ]
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedQuery)
    })
  }, [kindFilter, query, transactions])

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel title={isEditing ? 'Editar lancamento' : 'Novo lancamento'}>
        <form onSubmit={onSubmit} className="grid gap-4">
          {isEditing && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Edicao em andamento. Salve para persistir as alteracoes.
            </div>
          )}

          <div className="grid min-w-0 grid-cols-2 rounded-lg bg-slate-100 p-1">
            <TransactionTypeButton
              active={transactionForm.kind === 'expense'}
              label="Despesa"
              icon="expense"
              disabled={isEditing}
              onClick={() =>
                onTransactionFormChange({ ...transactionForm, kind: 'expense', id_categoria: '' })
              }
            />
            <TransactionTypeButton
              active={transactionForm.kind === 'income'}
              label="Receita"
              icon="income"
              disabled={isEditing}
              onClick={() =>
                onTransactionFormChange({ ...transactionForm, kind: 'income', id_categoria: '' })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={transactionForm.valor}
                onChange={(event) =>
                  onTransactionFormChange({ ...transactionForm, valor: event.target.value })
                }
                className={inputClass}
                placeholder="0,00"
              />
            </Field>
            <Field label="Data">
              <DateInput
                required
                value={transactionForm.data}
                ariaLabel="Data do lancamento"
                onChange={(data) => onTransactionFormChange({ ...transactionForm, data })}
              />
            </Field>
          </div>

          <Field label="Categoria">
            <SelectInput
              value={transactionForm.id_categoria}
              ariaLabel="Categoria do lancamento"
              placeholder="Selecione"
              onChange={(id_categoria) =>
                onTransactionFormChange({ ...transactionForm, id_categoria })
              }
              options={[
                { value: '', label: 'Selecione' },
                ...categories.map((category) => ({
                  value: String(category.id_categoria),
                  label: category.nome,
                })),
              ]}
            />
          </Field>

          <Field label="Descricao">
            <input
              value={transactionForm.descricao}
              onChange={(event) =>
                onTransactionFormChange({ ...transactionForm, descricao: event.target.value })
              }
              className={inputClass}
              placeholder="Ex.: mercado, salario, transporte"
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving === 'transaction'}>
              {saving === 'transaction' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              {isEditing ? 'Salvar alteracoes' : 'Salvar lancamento'}
            </Button>
            {isEditing && (
              <Button type="button" variant="ghost" onClick={onCancelEdit}>
                <CircleX className="h-4 w-4" aria-hidden="true" />
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Movimentacoes do periodo">
        <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por descricao, categoria ou valor"
              className={`${inputClass} pl-9`}
            />
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-extrabold">
            <KindFilterButton
              label="Todos"
              active={kindFilter === 'all'}
              onClick={() => setKindFilter('all')}
            />
            <KindFilterButton
              label="Despesas"
              active={kindFilter === 'expense'}
              onClick={() => setKindFilter('expense')}
            />
            <KindFilterButton
              label="Receitas"
              active={kindFilter === 'income'}
              onClick={() => setKindFilter('income')}
            />
          </div>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          saving={saving}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </Panel>
    </section>
  )
}

function TransactionTypeButton({
  active,
  label,
  icon,
  disabled,
  onClick,
}: {
  active: boolean
  label: string
  icon: 'income' | 'expense'
  disabled?: boolean
  onClick: () => void
}) {
  const Icon = icon === 'income' ? ArrowUpCircle : ArrowDownCircle
  const activeClass =
    icon === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-white text-rose-700 shadow-sm'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-55 ${
        active ? activeClass : 'text-slate-500'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}

function KindFilterButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 transition ${
        active ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {label}
    </button>
  )
}
