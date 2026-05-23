import { useCallback, useEffect, useMemo, useState } from 'react'
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
    request,
    refreshData,
    setError,
    setNotice,
    setSaving,
    setTransactionForm,
    transactionForm,
  })
  const { handleDeleteGoal, handleGoalProgress, handleGoalSubmit } = useGoalActions({
    goalForm,
    request,
    refreshData,
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
    passwordForm,
    profileForm,
    request,
    refreshData,
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
    request,
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
    dashboard,
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
    token,
    transactionCategories,
    transactionForm,
    transactions,
    user,
    year,
    years,
  }
}
