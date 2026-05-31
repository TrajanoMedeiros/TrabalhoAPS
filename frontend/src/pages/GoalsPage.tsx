import { useMemo, useState, type FormEvent } from 'react'
import { CircleX, Loader2, Pencil, Plus, Search, Target, Trash2 } from 'lucide-react'
import { DateInput } from '../components/form/DateInput'
import { SelectInput } from '../components/form/SelectInput'
import { Button, EmptyState, Field, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { Category, Goal, GoalForm, SavingAction } from '../types'
import { formatDate, formatMoney } from '../utils/format'

export function GoalsPage({
  goalForm,
  categories,
  goals,
  editingGoal,
  saving,
  onGoalFormChange,
  onSubmit,
  onEdit,
  onCancelEdit,
  onProgress,
  onDelete,
}: {
  goalForm: GoalForm
  categories: Category[]
  goals: Goal[]
  editingGoal: Goal | null
  saving: SavingAction
  onGoalFormChange: (value: GoalForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onEdit: (goal: Goal) => void
  onCancelEdit: () => void
  onProgress: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all')
  const isEditing = editingGoal !== null

  const filteredGoals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return goals.filter((goal) => {
      const isCompleted = goal.progresso_percentual >= 100

      if (statusFilter === 'active' && isCompleted) return false
      if (statusFilter === 'completed' && !isCompleted) return false
      if (!normalizedQuery) return true

      const searchable = [goal.titulo, goal.categoria_nome ?? '', goal.data_limite ?? '']
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedQuery)
    })
  }, [goals, query, statusFilter])

  return (
    <section className="grid min-w-0 gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel title={isEditing ? 'Editar meta' : 'Nova meta'}>
        <form onSubmit={onSubmit} className="grid gap-4">
          {isEditing && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Edicao em andamento. Salve para persistir as alteracoes.
            </div>
          )}

          <Field label="Titulo">
            <input
              required
              minLength={2}
              value={goalForm.titulo}
              onChange={(event) => onGoalFormChange({ ...goalForm, titulo: event.target.value })}
              className={inputClass}
              placeholder="Reserva de emergencia"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor alvo">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={goalForm.valor_alvo}
                onChange={(event) =>
                  onGoalFormChange({ ...goalForm, valor_alvo: event.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Valor atual">
              <input
                type="number"
                min="0"
                step="0.01"
                value={goalForm.valor_atual}
                onChange={(event) =>
                  onGoalFormChange({ ...goalForm, valor_atual: event.target.value })
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Prazo">
              <DateInput
                value={goalForm.data_limite}
                ariaLabel="Prazo da meta"
                placeholder="Sem prazo"
                onChange={(data_limite) => onGoalFormChange({ ...goalForm, data_limite })}
              />
            </Field>
            <Field label="Categoria">
              <SelectInput
                value={goalForm.id_categoria}
                ariaLabel="Categoria da meta"
                placeholder="Sem categoria"
                onChange={(id_categoria) => onGoalFormChange({ ...goalForm, id_categoria })}
                options={[
                  { value: '', label: 'Sem categoria' },
                  ...categories.map((category) => ({
                    value: String(category.id_categoria),
                    label: category.nome,
                  })),
                ]}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving === 'goal'}>
              {saving === 'goal' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Target className="h-4 w-4" aria-hidden="true" />
              )}
              {isEditing ? 'Salvar alteracoes' : 'Criar meta'}
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

      <Panel title="Metas em andamento">
        {goals.length > 0 ? (
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por titulo ou categoria"
                  className={`${inputClass} pl-9`}
                />
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-extrabold">
                <GoalFilterButton
                  label="Todas"
                  active={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                />
                <GoalFilterButton
                  label="Abertas"
                  active={statusFilter === 'active'}
                  onClick={() => setStatusFilter('active')}
                />
                <GoalFilterButton
                  label="Concl."
                  active={statusFilter === 'completed'}
                  onClick={() => setStatusFilter('completed')}
                />
              </div>
            </div>

            {filteredGoals.map((goal) => (
              <GoalCard
                key={goal.id_meta}
                goal={goal}
                editing={editingGoal?.id_meta === goal.id_meta}
                saving={saving}
                onEdit={onEdit}
                onProgress={onProgress}
                onDelete={onDelete}
              />
            ))}

            {filteredGoals.length === 0 && (
              <EmptyState>Nenhuma meta encontrada para o filtro atual.</EmptyState>
            )}
          </div>
        ) : (
          <EmptyState>Crie sua primeira meta para acompanhar progresso.</EmptyState>
        )}
      </Panel>
    </section>
  )
}

function GoalCard({
  goal,
  editing,
  saving,
  onEdit,
  onProgress,
  onDelete,
}: {
  goal: Goal
  editing: boolean
  saving: SavingAction
  onEdit: (goal: Goal) => void
  onProgress: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}) {
  return (
    <article
      className={`border-b pb-4 last:border-0 ${
        editing ? 'rounded-2xl border-amber-200 bg-amber-50/40 p-3' : 'border-slate-100'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-slate-950">{goal.titulo}</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {goal.categoria_nome ?? 'Sem categoria'} | {formatDate(goal.data_limite)}
          </p>
        </div>
        <p className="text-right font-black text-slate-950">
          {formatMoney(goal.valor_atual)}
          <span className="block text-xs font-bold text-slate-500">
            de {formatMoney(goal.valor_alvo)}
          </span>
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-600"
          style={{ width: `${goal.progresso_percentual}%` }}
        />
      </div>
      <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-sm font-extrabold text-emerald-700">
          {goal.progresso_percentual.toFixed(1)}% concluida
        </p>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          <Button
            variant="ghost"
            onClick={() => onEdit(goal)}
            disabled={saving === 'goal'}
            className="min-h-10 px-3"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Button>
          <Button
            variant="ghost"
            onClick={() => void onProgress(goal)}
            disabled={saving === 'goal-progress' || goal.progresso_percentual >= 100}
            className="min-h-10 px-3"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            10%
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(goal)}
            disabled={saving === 'delete'}
            className="min-h-10 px-3"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remover
          </Button>
        </div>
      </div>
    </article>
  )
}

function GoalFilterButton({
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
