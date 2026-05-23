import type { FormEvent } from 'react'
import { Loader2, Plus, Target, Trash2 } from 'lucide-react'
import { Button, EmptyState, Field, Panel } from '../components/ui'
import { inputClass } from '../styles/tokens'
import type { Category, Goal, GoalForm, SavingAction } from '../types'
import { formatDate, formatMoney } from '../utils/format'

export function GoalsPage({
  goalForm,
  categories,
  goals,
  saving,
  onGoalFormChange,
  onSubmit,
  onProgress,
  onDelete,
}: {
  goalForm: GoalForm
  categories: Category[]
  goals: Goal[]
  saving: SavingAction
  onGoalFormChange: (value: GoalForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onProgress: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel title="Nova meta">
        <form onSubmit={onSubmit} className="grid gap-4">
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
              <input
                type="date"
                value={goalForm.data_limite}
                onChange={(event) =>
                  onGoalFormChange({ ...goalForm, data_limite: event.target.value })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Categoria">
              <select
                value={goalForm.id_categoria}
                onChange={(event) =>
                  onGoalFormChange({ ...goalForm, id_categoria: event.target.value })
                }
                className={inputClass}
              >
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id_categoria} value={category.id_categoria}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Button type="submit" disabled={saving === 'goal'}>
            {saving === 'goal' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Target className="h-4 w-4" aria-hidden="true" />
            )}
            Criar meta
          </Button>
        </form>
      </Panel>

      <Panel title="Metas em andamento">
        {goals.length > 0 ? (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id_meta}
                goal={goal}
                saving={saving}
                onProgress={onProgress}
                onDelete={onDelete}
              />
            ))}
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
  saving,
  onProgress,
  onDelete,
}: {
  goal: Goal
  saving: SavingAction
  onProgress: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}) {
  return (
    <article className="border-b border-slate-100 pb-4 last:border-0">
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
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-extrabold text-emerald-700">
          {goal.progresso_percentual.toFixed(1)}% concluida
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => void onProgress(goal)}
            disabled={saving === 'goal-progress' || goal.progresso_percentual >= 100}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            10%
          </Button>
          <Button variant="danger" onClick={() => onDelete(goal)} disabled={saving === 'delete'}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Remover
          </Button>
        </div>
      </div>
    </article>
  )
}
