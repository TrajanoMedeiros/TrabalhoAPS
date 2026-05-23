import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import { today } from '../../stores/forms'
import type { SavingAction, TransactionForm, TransactionWithKind } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type TransactionActionDependencies = {
  request: ApiRequest
  refreshData: () => Promise<void>
  transactionForm: TransactionForm
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
  setTransactionForm: Setter<TransactionForm>
}

export function useTransactionActions({
  request,
  refreshData,
  transactionForm,
  setError,
  setNotice,
  setSaving,
  setTransactionForm,
}: TransactionActionDependencies) {
  async function handleTransactionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('transaction')
    setError(null)
    setNotice(null)

    try {
      await request(transactionForm.kind === 'income' ? '/api/incomes' : '/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          valor: Number(transactionForm.valor),
          data: transactionForm.data,
          descricao: transactionForm.descricao || null,
          id_categoria: Number(transactionForm.id_categoria),
        }),
      })

      setTransactionForm((current) => ({
        ...current,
        valor: '',
        data: today,
        descricao: '',
        id_categoria: '',
      }))
      setNotice('Lancamento registrado.')
      await refreshData()
    } catch (transactionError) {
      setError(getErrorMessage(transactionError, 'Nao foi possivel salvar o lancamento.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleDeleteTransaction(transaction: TransactionWithKind) {
    if (!window.confirm('Remover este lancamento?')) return

    setSaving('delete')
    setError(null)
    setNotice(null)

    try {
      await request(
        `${transaction.kind === 'income' ? '/api/incomes' : '/api/expenses'}/${transaction.id}`,
        { method: 'DELETE' },
      )
      setNotice('Lancamento removido.')
      await refreshData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Nao foi possivel remover o lancamento.'))
    } finally {
      setSaving(null)
    }
  }

  return { handleDeleteTransaction, handleTransactionSubmit }
}
