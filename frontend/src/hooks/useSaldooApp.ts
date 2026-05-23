import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ApiError, api } from '../services/api'
import { getErrorMessage } from '../services/error'
import type {
  AuthForm,
  AuthMode,
  AuthPayload,
  Category,
  CategoryForm,
  ChatMessage,
  ChatPayload,
  Dashboard,
  Goal,
  GoalForm,
  HistoryItem,
  PasswordForm,
  ProfileForm,
  SavingAction,
  Score,
  Transaction,
  TransactionForm,
  TransactionWithKind,
  User,
  View,
} from '../types'

const tokenKey = 'saldoo.auth.token'
const today = new Date().toISOString().slice(0, 10)
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

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

  const [authForm, setAuthForm] = useState<AuthForm>({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: 'personal',
  })
  const [transactionForm, setTransactionForm] = useState<TransactionForm>({
    kind: 'expense',
    valor: '',
    data: today,
    descricao: '',
    id_categoria: '',
  })
  const [goalForm, setGoalForm] = useState<GoalForm>({
    titulo: '',
    valor_alvo: '',
    valor_atual: '',
    data_limite: '',
    id_categoria: '',
  })
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    nome: '',
    tipo: 'expense',
  })
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    nome: '',
    email: '',
    tipo_usuario: 'personal',
  })
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    senha_atual: '',
    nova_senha: '',
  })
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Me conte sua duvida financeira e eu respondo usando seus dados do Saldoo.',
    },
  ])

  const years = useMemo(() => [currentYear - 1, currentYear, currentYear + 1], [])
  const transactionCategories = useMemo(
    () =>
      categories.filter(
        (category) => category.tipo === 'both' || category.tipo === transactionForm.kind,
      ),
    [categories, transactionForm.kind],
  )
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.tipo === 'both' || category.tipo === 'expense'),
    [categories],
  )
  const transactions = useMemo<TransactionWithKind[]>(
    () =>
      [
        ...incomes.map((transaction) => ({ ...transaction, kind: 'income' as const })),
        ...expenses.map((transaction) => ({ ...transaction, kind: 'expense' as const })),
      ].sort((a, b) => b.data.localeCompare(a.data) || b.id - a.id),
    [expenses, incomes],
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
    setNotice(null)
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

  function saveSession(payload: AuthPayload) {
    window.localStorage.setItem(tokenKey, payload.token)
    setToken(payload.token)
    setUser(payload.user)
    syncProfileForm(payload.user)
    setActiveView('dashboard')
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('auth')
    setError(null)
    setNotice(null)

    try {
      const payload =
        authMode === 'register'
          ? {
              nome: authForm.nome,
              email: authForm.email,
              senha: authForm.senha,
              tipo_usuario: authForm.tipo_usuario,
            }
          : {
              email: authForm.email,
              senha: authForm.senha,
            }

      const authPayload = await api<AuthPayload>(
        authMode === 'register' ? '/api/auth/register' : '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      )

      saveSession(authPayload)
      setNotice(authMode === 'register' ? 'Conta criada com sucesso.' : 'Login realizado.')
    } catch (authError) {
      setError(getErrorMessage(authError, 'Nao foi possivel autenticar.'))
    } finally {
      setSaving(null)
    }
  }

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

  async function handleGoalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('goal')
    setError(null)
    setNotice(null)

    try {
      await request('/api/goals', {
        method: 'POST',
        body: JSON.stringify({
          titulo: goalForm.titulo,
          valor_alvo: Number(goalForm.valor_alvo),
          valor_atual: Number(goalForm.valor_atual || 0),
          data_limite: goalForm.data_limite || null,
          id_categoria: goalForm.id_categoria ? Number(goalForm.id_categoria) : null,
        }),
      })

      setGoalForm({
        titulo: '',
        valor_alvo: '',
        valor_atual: '',
        data_limite: '',
        id_categoria: '',
      })
      setNotice('Meta criada.')
      await refreshData()
    } catch (goalError) {
      setError(getErrorMessage(goalError, 'Nao foi possivel salvar a meta.'))
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
      setNotice('Meta removida.')
      await refreshData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Nao foi possivel remover a meta.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('category')
    setError(null)
    setNotice(null)

    try {
      await request('/api/categories', {
        method: 'POST',
        body: JSON.stringify(categoryForm),
      })
      setCategoryForm({ nome: '', tipo: 'expense' })
      setNotice('Categoria criada.')
      await refreshData()
    } catch (categoryError) {
      setError(getErrorMessage(categoryError, 'Nao foi possivel criar a categoria.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleDeleteCategory(category: Category) {
    if (!window.confirm('Remover esta categoria?')) return

    setSaving('delete')
    setError(null)
    setNotice(null)

    try {
      await request(`/api/categories/${category.id_categoria}`, { method: 'DELETE' })
      setNotice('Categoria removida.')
      await refreshData()
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, 'Nao foi possivel remover a categoria.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('profile')
    setError(null)
    setNotice(null)

    try {
      const payload = await request<{ user: User }>('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      })
      setUser(payload.user)
      syncProfileForm(payload.user)
      setNotice('Perfil atualizado.')
    } catch (profileError) {
      setError(getErrorMessage(profileError, 'Nao foi possivel atualizar o perfil.'))
    } finally {
      setSaving(null)
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving('password')
    setError(null)
    setNotice(null)

    try {
      await request('/api/users/password', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      })
      setPasswordForm({ senha_atual: '', nova_senha: '' })
      setNotice('Senha atualizada.')
    } catch (passwordError) {
      setError(getErrorMessage(passwordError, 'Nao foi possivel atualizar a senha.'))
    } finally {
      setSaving(null)
    }
  }

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = chatInput.trim()
    if (!message) return

    setSaving('chat')
    setError(null)
    setNotice(null)
    setChatInput('')
    setChatMessages((current) => [...current, { role: 'user', content: message }])

    try {
      const payload = await request<ChatPayload>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ mensagem: message }),
      })
      setChatMessages((current) => [
        ...current,
        { role: 'assistant', content: payload.chat.resposta },
      ])
    } catch (chatError) {
      setError(getErrorMessage(chatError, 'Nao foi possivel responder agora.'))
    } finally {
      setSaving(null)
    }
  }

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
