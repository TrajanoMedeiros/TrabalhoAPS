import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import { initialGoalForm } from '../../stores/forms'
import type { Goal, GoalForm, SavingAction } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type GoalActionDependencies = {
  editingGoal: Goal | null
  goalForm: GoalForm
  request: ApiRequest
  refreshData: () => Promise<void>
  setEditingGoal: Setter<Goal | null>
  setError: Setter<string | null>
  setGoalForm: Setter<GoalForm>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
}

export function useGoalActions({
  editingGoal,
  goalForm,
  request,
  refreshData,
  setEditingGoal,
  setError,
  setGoalForm,
  setNotice,
  setSaving,
}: GoalActionDependencies) {
  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const isEditing = editingGoal !== null

    setSaving('goal')
    setError(null)
    setNotice(null)

    try {
      await request(
        isEditing ? `/api/goals/${editingGoal.id_meta}` : '/api/goals',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify({
            titulo: goalForm.titulo,
            valor_alvo: Number(goalForm.valor_alvo),
            valor_atual: Number(goalForm.valor_atual || 0),
            data_limite: goalForm.data_limite || null,
            id_categoria: goalForm.id_categoria ? Number(goalForm.id_categoria) : null,
          }),
        },
      )

      setGoalForm(initialGoalForm)
      setEditingGoal(null)
      setNotice(isEditing ? 'Meta atualizada.' : 'Meta criada.')
      await refreshData()
    } catch (goalError) {
      setError(
        getErrorMessage(
          goalError,
          isEditing ? 'Nao foi possivel atualizar a meta.' : 'Nao foi possivel salvar a meta.',
        ),
      )
    } finally {
      setSaving(null)
    }
  }

  async function handleGoalProgress(goal: Goal) {
    setSaving('goal-progress')
    setError(null)
    setNotice(null)

    try {
      const increment = Math.max(goal.valor_alvo * 0.1, 1)
      await request(`/api/goals/${goal.id_meta}`, {
        method: 'PUT',
        body: JSON.stringify({
          titulo: goal.titulo,
          valor_alvo: goal.valor_alvo,
          valor_atual: Math.min(goal.valor_alvo, goal.valor_atual + increment),
          data_limite: goal.data_limite,
          id_categoria: goal.id_categoria,
        }),
      })
      setNotice('Progresso atualizado.')
      await refreshData()
    } catch (goalError) {
      setError(getErrorMessage(goalError, 'Nao foi possivel atualizar a meta.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleDeleteGoal(goal: Goal) {
    if (!window.confirm('Remover esta meta?')) return

    setSaving('delete')
    setError(null)
    setNotice(null)

    try {
      await request(`/api/goals/${goal.id_meta}`, { method: 'DELETE' })

      if (editingGoal && editingGoal.id_meta === goal.id_meta) {
        setGoalForm(initialGoalForm)
        setEditingGoal(null)
      }

      setNotice('Meta removida.')
      await refreshData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Nao foi possivel remover a meta.'))
    } finally {
      setSaving(null)
    }
  }

  return { handleDeleteGoal, handleGoalProgress, handleGoalSubmit }
}
