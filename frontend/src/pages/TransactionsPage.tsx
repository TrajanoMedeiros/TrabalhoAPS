import type { FormEvent } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Loader2, Plus } from 'lucide-react'
import { TransactionList } from '../components/finance/TransactionList'
import { Button, Field, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { Category, SavingAction, TransactionForm, TransactionWithKind } from '../types'

export function TransactionsPage({
  transactionForm,
  categories,
  transactions,
  saving,
  onTransactionFormChange,
  onSubmit,
  onDelete,
}: {
  transactionForm: TransactionForm
  categories: Category[]
  transactions: TransactionWithKind[]
  saving: SavingAction
  onTransactionFormChange: (value: TransactionForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: (transaction: TransactionWithKind) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel title="Novo lancamento">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <TransactionTypeButton
              active={transactionForm.kind === 'expense'}
              label="Despesa"
              icon="expense"
              onClick={() =>
                onTransactionFormChange({ ...transactionForm, kind: 'expense', id_categoria: '' })
              }
            />
            <TransactionTypeButton
              active={transactionForm.kind === 'income'}
              label="Receita"
              icon="income"
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
              <input
                required
                type="date"
                value={transactionForm.data}
                onChange={(event) =>
                  onTransactionFormChange({ ...transactionForm, data: event.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Categoria">
            <select
              required
              value={transactionForm.id_categoria}
              onChange={(event) =>
                onTransactionFormChange({ ...transactionForm, id_categoria: event.target.value })
              }
              className={inputClass}
            >
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id_categoria} value={category.id_categoria}>
                  {category.nome}
                </option>
              ))}
            </select>
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

          <Button type="submit" disabled={saving === 'transaction'}>
            {saving === 'transaction' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            Salvar lancamento
          </Button>
        </form>
      </Panel>

      <Panel title="Movimentacoes do periodo">
        <TransactionList transactions={transactions} saving={saving} onDelete={onDelete} />
      </Panel>
    </section>
  )
}

function TransactionTypeButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: 'income' | 'expense'
  onClick: () => void
}) {
  const Icon = icon === 'income' ? ArrowUpCircle : ArrowDownCircle
  const activeClass =
    icon === 'income' ? 'bg-white text-emerald-700 shadow-sm' : 'bg-white text-rose-700 shadow-sm'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
        active ? activeClass : 'text-slate-500'
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  )
}
