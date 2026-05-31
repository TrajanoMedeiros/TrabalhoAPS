import type { FormEvent } from 'react'
import { getErrorMessage } from '../../services/error'
import { today } from '../../stores/forms'
import type { SavingAction, TransactionForm, TransactionWithKind } from '../../types'
import type { ApiRequest, Setter } from '../shared'

type TransactionActionDependencies = {
  editingTransaction: TransactionWithKind | null
  request: ApiRequest
  refreshData: () => Promise<void>
  transactionForm: TransactionForm
  setEditingTransaction: Setter<TransactionWithKind | null>
  setError: Setter<string | null>
  setNotice: Setter<string | null>
  setSaving: Setter<SavingAction>
  setTransactionForm: Setter<TransactionForm>
}

export function useTransactionActions({
  editingTransaction,
  request,
  refreshData,
  transactionForm,
  setEditingTransaction,
  setError,
  setNotice,
  setSaving,
  setTransactionForm,
}: TransactionActionDependencies) {
  function resetTransactionForm(kind: TransactionForm['kind']) {
    setTransactionForm({
      kind,
      valor: '',
      data: today,
      descricao: '',
      id_categoria: '',
    })
  }

  async function handleTransactionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!transactionForm.id_categoria) {
      setError('Selecione uma categoria antes de salvar.')
      return
    }

    const isEditing = editingTransaction !== null
    const transactionKind = editingTransaction?.kind ?? transactionForm.kind
    const resourcePath = transactionKind === 'income' ? '/api/incomes' : '/api/expenses'

    setSaving('transaction')
    setError(null)
    setNotice(null)

    try {
      await request(
        isEditing ? `${resourcePath}/${editingTransaction.id}` : resourcePath,
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify({
            valor: Number(transactionForm.valor),
            data: transactionForm.data,
            descricao: transactionForm.descricao.trim() || null,
            id_categoria: Number(transactionForm.id_categoria),
          }),
        },
      )

      resetTransactionForm(transactionKind)
      setEditingTransaction(null)
      setNotice(isEditing ? 'Lancamento atualizado.' : 'Lancamento registrado.')
      await refreshData()
    } catch (transactionError) {
      setError(
        getErrorMessage(
          transactionError,
          isEditing
            ? 'Nao foi possivel atualizar o lancamento.'
            : 'Nao foi possivel salvar o lancamento.',
        ),
      )
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

      if (
        editingTransaction &&
        editingTransaction.id === transaction.id &&
        editingTransaction.kind === transaction.kind
      ) {
        resetTransactionForm(transaction.kind)
        setEditingTransaction(null)
      }

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
