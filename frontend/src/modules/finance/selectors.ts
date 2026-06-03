import type { Category, Transaction, TransactionKind, TransactionWithKind } from '../../types'

export function filterTransactionCategories(
  categories: Category[],
  kind: TransactionKind,
): Category[] {
  return categories.filter((category) => category.tipo === 'both' || category.tipo === kind)
}

export function filterExpenseCategories(categories: Category[]): Category[] {
  return categories.filter((category) => category.tipo === 'both' || category.tipo === 'expense')
}

export function mergeTransactions(
  incomes: Transaction[],
  expenses: Transaction[],
): TransactionWithKind[] {
  return [
    ...incomes.map((transaction) => ({ ...transaction, kind: 'income' as const })),
    ...expenses.map((transaction) => ({ ...transaction, kind: 'expense' as const })),
  ].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id)
}
