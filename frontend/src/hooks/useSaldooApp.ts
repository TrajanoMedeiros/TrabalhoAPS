import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildAssistantSuggestions,
  buildAssistantWelcomeMessage,
  createChatMessage,
} from '../modules/assistant/chatExperience'
import { useAssistantActions } from '../modules/assistant/useAssistantActions'
import { useAuthFlow } from '../modules/auth/useAuthFlow'
import {
  filterExpenseCategories,
  filterTransactionCategories,
  mergeTransactions,
} from '../modules/finance/selectors'
import { useGoalActions } from '../modules/finance/useGoalActions'
import { useTransactionActions } from '../modules/finance/useTransactionActions'
import { useSettingsActions } from '../modules/settings/useSettingsActions'
import { ApiError, api } from '../services/api'
import { getErrorMessage } from '../services/error'
import {
  currentMonth,
  currentYear,
  initialAuthForm,
  initialCategoryForm,
  initialChatMessages,
  initialGoalForm,
  initialPasswordForm,
  initialProfileForm,
  initialTransactionForm,
  tokenKey,
} from '../stores/forms'
import type {
  AuthMode,
  Category,
  Dashboard,
  Goal,
  HistoryItem,
  SavingAction,
  Score,
  Transaction,
  TransactionWithKind,
  User,
  View,
} from '../types'

export function useSaldooApp() {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(tokenKey))
  const [user, setUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [booting, setBooting] = useState(() => Boolean(window.localStorage.getItem(tokenKey)))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<SavingAction>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)

  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [score, setScore] = useState<Score | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [incomes, setIncomes] = useState<Transaction[]>([])
  const [expenses, setExpenses] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])

  const [authForm, setAuthForm] = useState(initialAuthForm)
  const [transactionForm, setTransactionForm] = useState(initialTransactionForm)
  const [goalForm, setGoalForm] = useState(initialGoalForm)
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithKind | null>(null)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState(initialChatMessages)

  const years = useMemo(() => [currentYear - 1, currentYear, currentYear + 1], [])
  const transactionCategories = useMemo(
    () => filterTransactionCategories(categories, transactionForm.kind),
    [categories, transactionForm.kind],
  )
  const expenseCategories = useMemo(() => filterExpenseCategories(categories), [categories])
  const transactions = useMemo(() => mergeTransactions(incomes, expenses), [expenses, incomes])
  const assistantWelcomeMessage = useMemo(
    () => buildAssistantWelcomeMessage({ dashboard, score }),
    [dashboard, score],
  )
  const assistantSuggestions = useMemo(
    () => buildAssistantSuggestions({ dashboard, score }),
    [dashboard, score],
  )

  const request = useCallback(
    async <T,>(path: string, options: RequestInit = {}) => api<T>(path, options, token),
    [token],
  )

  const syncProfileForm = useCallback((nextUser: User) => {
    setProfileForm({
      nome: nextUser.nome,
      email: nextUser.email,
      tipo_usuario: nextUser.tipo_usuario,
    })
  }, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(tokenKey)
    setToken(null)
    setUser(null)
    setDashboard(null)
    setScore(null)
    setHistory([])
    setCategories([])
    setIncomes([])
    setExpenses([])
    setGoals([])
    setEditingTransaction(null)
    setEditingGoal(null)
    setEditingCategory(null)
    setNotice(null)
    setActiveView('dashboard')
  }, [])

  const refreshData = useCallback(
    async (authToken = token) => {
      if (!authToken) return

      setLoading(true)
      setError(null)

      try {
        const [
          mePayload,
          dashboardPayload,
          historyPayload,
          scorePayload,
          categoryPayload,
          incomePayload,
          expensePayload,
          goalPayload,
        ] = await Promise.all([
          api<{ user: User }>('/api/auth/me', {}, authToken),
          api<{ dashboard: Dashboard }>(`/api/dashboard?mes=${month}&ano=${year}`, {}, authToken),
          api<{ history: HistoryItem[] }>('/api/dashboard/history?meses=6', {}, authToken),
          api<{ score: Score }>('/api/score', {}, authToken),
          api<{ categories: Category[] }>('/api/categories', {}, authToken),
          api<{ incomes: Transaction[] }>(`/api/incomes?mes=${month}&ano=${year}`, {}, authToken),
          api<{ expenses: Transaction[] }>(`/api/expenses?mes=${month}&ano=${year}`, {}, authToken),
          api<{ goals: Goal[] }>('/api/goals', {}, authToken),
        ])

        setUser(mePayload.user)
        syncProfileForm(mePayload.user)
        setDashboard(dashboardPayload.dashboard)
        setHistory(historyPayload.history)
        setScore(scorePayload.score)
        setCategories(categoryPayload.categories)
        setIncomes(incomePayload.incomes)
        setExpenses(expensePayload.expenses)
        setGoals(goalPayload.goals)
      } catch (refreshError) {
        if (refreshError instanceof ApiError && refreshError.status === 401) {
          logout()
          setError('Sua sessao expirou. Entre novamente para continuar.')
        } else {
          setError(getErrorMessage(refreshError, 'Nao foi possivel carregar seus dados.'))
        }
      } finally {
        setBooting(false)
        setLoading(false)
      }
    },
    [logout, month, syncProfileForm, token, year],
  )

  useEffect(() => {
    if (!token) return

    const refreshTimeout = window.setTimeout(() => {
      void refreshData(token)
    }, 0)

    return () => window.clearTimeout(refreshTimeout)
  }, [refreshData, token])

  const startTransactionEdit = useCallback((transaction: TransactionWithKind) => {
    setEditingTransaction(transaction)
    setTransactionForm({
      kind: transaction.kind,
      valor: String(transaction.valor),
      data: transaction.data,
      descricao: transaction.descricao ?? '',
      id_categoria: String(transaction.id_categoria),
    })
    setActiveView('transactions')
  }, [])

  const cancelTransactionEdit = useCallback(() => {
    setEditingTransaction(null)
    setTransactionForm(initialTransactionForm)
  }, [])

  const startGoalEdit = useCallback((goal: Goal) => {
    setEditingGoal(goal)
    setGoalForm({
      titulo: goal.titulo,
      valor_alvo: String(goal.valor_alvo),
      valor_atual: String(goal.valor_atual),
      data_limite: goal.data_limite ?? '',
      id_categoria: goal.id_categoria ? String(goal.id_categoria) : '',
    })
    setActiveView('goals')
  }, [])

  const cancelGoalEdit = useCallback(() => {
    setEditingGoal(null)
    setGoalForm(initialGoalForm)
  }, [])

  const startCategoryEdit = useCallback((category: Category) => {
    setEditingCategory(category)
    setCategoryForm({
      nome: category.nome,
      tipo: category.tipo,
    })
    setActiveView('settings')
  }, [])

  const cancelCategoryEdit = useCallback(() => {
    setEditingCategory(null)
    setCategoryForm(initialCategoryForm)
  }, [])

  const restartChatConversation = useCallback(
    (withConfirmation = false) => {
      if (
        withConfirmation &&
        chatMessages.length > 1 &&
        !window.confirm('Deseja reiniciar a conversa? O historico atual sera substituido.')
      ) {
        return
      }

      setChatInput('')
      setChatMessages([
        createChatMessage('assistant', assistantWelcomeMessage),
      ])
      setNotice('Conversa reiniciada.')
      setError(null)
    },
    [assistantWelcomeMessage, chatMessages.length],
  )

  const clearChatConversation = useCallback(() => {
    if (chatMessages.length === 0) return
    if (
      !window.confirm(
        'Limpar toda a conversa agora? Esta acao remove o historico desta sessao.',
      )
    ) {
      return
    }

    setChatInput('')
    setChatMessages([])
    setNotice('Conversa limpa. Quando quiser, inicie um novo dialogo.')
    setError(null)
  }, [chatMessages.length])

  const { handleAuth } = useAuthFlow({
    authMode,
    authForm,
    setActiveView,
    setError,
    setNotice,
    setSaving,
    setToken,
    setUser,
    syncProfileForm,
  })
  const { handleDeleteTransaction, handleTransactionSubmit } = useTransactionActions({
    editingTransaction,
    request,
    refreshData,
    setEditingTransaction,
    setError,
    setNotice,
    setSaving,
    setTransactionForm,
    transactionForm,
  })
  const { handleDeleteGoal, handleGoalProgress, handleGoalSubmit } = useGoalActions({
    editingGoal,
    goalForm,
    request,
    refreshData,
    setEditingGoal,
    setError,
    setGoalForm,
    setNotice,
    setSaving,
  })
  const {
    handleCategorySubmit,
    handleDeleteCategory,
    handlePasswordSubmit,
    handleProfileSubmit,
  } = useSettingsActions({
    categoryForm,
    editingCategory,
    passwordForm,
    profileForm,
    request,
    refreshData,
    setEditingCategory,
    setCategoryForm,
    setError,
    setNotice,
    setPasswordForm,
    setSaving,
    setUser,
    syncProfileForm,
  })
  const { handleChatSubmit } = useAssistantActions({
    chatInput,
    dashboard,
    request,
    score,
    setChatInput,
    setChatMessages,
    setError,
    setNotice,
    setSaving,
  })

  return {
    activeView,
    authForm,
    authMode,
    booting,
    categoryForm,
    categories,
    chatInput,
    chatMessages,
    cancelCategoryEdit,
    clearChatConversation,
    cancelGoalEdit,
    cancelTransactionEdit,
    dashboard,
    editingCategory,
    editingGoal,
    editingTransaction,
    error,
    expenseCategories,
    goalForm,
    goals,
    handleAuth,
    handleCategorySubmit,
    handleChatSubmit,
    handleDeleteCategory,
    handleDeleteGoal,
    handleDeleteTransaction,
    handleGoalProgress,
    handleGoalSubmit,
    handlePasswordSubmit,
    handleProfileSubmit,
    handleTransactionSubmit,
    history,
    loading,
    logout,
    month,
    notice,
    passwordForm,
    profileForm,
    refreshData,
    saving,
    score,
    setActiveView,
    setAuthForm,
    setAuthMode,
    setCategoryForm,
    setChatInput,
    setGoalForm,
    setMonth,
    setPasswordForm,
    setProfileForm,
    setTransactionForm,
    setYear,
    restartChatConversation,
    startCategoryEdit,
    startGoalEdit,
    startTransactionEdit,
    assistantSuggestions,
    assistantWelcomeMessage,
    token,
    transactionCategories,
    transactionForm,
    transactions,
    user,
    year,
    years,
  }
}
