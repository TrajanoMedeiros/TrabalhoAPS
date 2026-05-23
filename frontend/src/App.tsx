import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Bot,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquareText,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  UserRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'
import { ApiError, api } from './lib/api'
import { formatDate, formatMoney, monthName } from './lib/format'
import type { Category, Dashboard, Goal, HistoryItem, Score, Transaction, User } from './types'
import { Button, EmptyState, Field, Panel } from './components'

type AuthMode = 'login' | 'register'
type View = 'dashboard' | 'transactions' | 'goals' | 'assistant' | 'settings'
type TransactionKind = 'income' | 'expense'
type SavingAction =
  | 'auth'
  | 'transaction'
  | 'goal'
  | 'goal-progress'
  | 'category'
  | 'profile'
  | 'password'
  | 'chat'
  | 'delete'
  | null

type AuthPayload = {
  user: User
  token: string
  expires_at: string
}

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatPayload = {
  chat: {
    resposta: string
    contexto: {
      saldo_atual: number
      total_receitas: number
      total_despesas: number
      score: number
      nivel: string
    }
  }
}

const tokenKey = 'saldoo.auth.token'
const today = new Date().toISOString().slice(0, 10)
const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const inputClass =
  'min-h-11 rounded-lg border border-slate-200 bg-white px-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100'

const navItems: Array<{ key: View; label: string; icon: LucideIcon }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Lancamentos', icon: ReceiptText },
  { key: 'goals', label: 'Metas', icon: Target },
  { key: 'assistant', label: 'Assistente', icon: Bot },
  { key: 'settings', label: 'Ajustes', icon: Settings },
]

function getErrorMessage(error: unknown, fallback = 'Nao foi possivel concluir a acao.'): string {
  if (error instanceof ApiError) {
    const firstFieldError = Object.values(error.details ?? {})[0]?.[0]
    return firstFieldError ?? error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

function App() {
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

  const [authForm, setAuthForm] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo_usuario: 'personal' as User['tipo_usuario'],
  })
  const [transactionForm, setTransactionForm] = useState({
    kind: 'expense' as TransactionKind,
    valor: '',
    data: today,
    descricao: '',
    id_categoria: '',
  })
  const [goalForm, setGoalForm] = useState({
    titulo: '',
    valor_alvo: '',
    valor_atual: '',
    data_limite: '',
    id_categoria: '',
  })
  const [categoryForm, setCategoryForm] = useState({
    nome: '',
    tipo: 'expense' as Category['tipo'],
  })
  const [profileForm, setProfileForm] = useState({
    nome: '',
    email: '',
    tipo_usuario: 'personal' as User['tipo_usuario'],
  })
  const [passwordForm, setPasswordForm] = useState({
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
  const transactions = useMemo(
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

  function syncProfileForm(nextUser: User) {
    setProfileForm({
      nome: nextUser.nome,
      email: nextUser.email,
      tipo_usuario: nextUser.tipo_usuario,
    })
  }

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
    [month, token, year],
  )

  useEffect(() => {
    if (!token) return

    const refreshTimeout = window.setTimeout(() => {
      void refreshData(token)
    }, 0)

    return () => window.clearTimeout(refreshTimeout)
  }, [refreshData, token])

  function logout() {
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
  }

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
      await request(
        transactionForm.kind === 'income' ? '/api/incomes' : '/api/expenses',
        {
          method: 'POST',
          body: JSON.stringify({
            valor: Number(transactionForm.valor),
            data: transactionForm.data,
            descricao: transactionForm.descricao || null,
            id_categoria: Number(transactionForm.id_categoria),
          }),
        },
      )

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

  async function handleDeleteTransaction(transaction: Transaction & { kind: TransactionKind }) {
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

  if (!token) {
    return (
      <AuthScreen
        authMode={authMode}
        authForm={authForm}
        error={error}
        isSaving={saving === 'auth'}
        onAuthModeChange={setAuthMode}
        onSubmit={handleAuth}
        onAuthFormChange={setAuthForm}
      />
    )
  }

  if (booting) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f2] text-slate-950">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-700" aria-hidden="true" />
          <span className="font-bold">Carregando Saldoo...</span>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 lg:flex">
        <Brand />
        <nav className="mt-8 grid gap-2" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeView === item.key}
              onClick={() => setActiveView(item.key)}
            />
          ))}
        </nav>
        <div className="mt-auto rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
            Saldo atual
          </p>
          <p className="mt-2 text-2xl font-black text-slate-950">
            {formatMoney(dashboard?.saldo_atual ?? 0)}
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="lg:hidden">
                <Brand />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-500">Periodo selecionado</p>
                <h1 className="text-2xl font-black text-slate-950">
                  {monthName(month)} de {year}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Mes"
                  value={month}
                  onChange={(event) => setMonth(Number(event.target.value))}
                  className={`${inputClass} min-w-28`}
                >
                  {Array.from({ length: 12 }, (_, index) => index + 1).map((option) => (
                    <option key={option} value={option}>
                      {monthName(option)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Ano"
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  className={`${inputClass} min-w-24`}
                >
                  {years.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <Button variant="ghost" onClick={() => void refreshData()} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                  )}
                  Atualizar
                </Button>
                <Button variant="danger" onClick={logout}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sair
                </Button>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Navegacao mobile">
              {navItems.map((item) => (
                <NavButton
                  key={item.key}
                  item={item}
                  active={activeView === item.key}
                  onClick={() => setActiveView(item.key)}
                  compact
                />
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <PageTitle activeView={activeView} user={user} />

          {error && (
            <Alert tone="error" icon={ShieldCheck}>
              {error}
            </Alert>
          )}
          {notice && (
            <Alert tone="success" icon={CheckCircle2}>
              {notice}
            </Alert>
          )}

          {activeView === 'dashboard' && (
            <DashboardView
              dashboard={dashboard}
              score={score}
              history={history}
              transactions={transactions}
              onTransactionDelete={handleDeleteTransaction}
              saving={saving}
            />
          )}
          {activeView === 'transactions' && (
            <TransactionsView
              transactionForm={transactionForm}
              categories={transactionCategories}
              transactions={transactions}
              saving={saving}
              onTransactionFormChange={setTransactionForm}
              onSubmit={handleTransactionSubmit}
              onDelete={handleDeleteTransaction}
            />
          )}
          {activeView === 'goals' && (
            <GoalsView
              goalForm={goalForm}
              categories={expenseCategories}
              goals={goals}
              saving={saving}
              onGoalFormChange={setGoalForm}
              onSubmit={handleGoalSubmit}
              onProgress={handleGoalProgress}
              onDelete={handleDeleteGoal}
            />
          )}
          {activeView === 'assistant' && (
            <AssistantView
              messages={chatMessages}
              chatInput={chatInput}
              saving={saving}
              onChatInputChange={setChatInput}
              onSubmit={handleChatSubmit}
            />
          )}
          {activeView === 'settings' && (
            <SettingsView
              profileForm={profileForm}
              passwordForm={passwordForm}
              categoryForm={categoryForm}
              categories={categories}
              saving={saving}
              onProfileFormChange={setProfileForm}
              onPasswordFormChange={setPasswordForm}
              onCategoryFormChange={setCategoryForm}
              onProfileSubmit={handleProfileSubmit}
              onPasswordSubmit={handlePasswordSubmit}
              onCategorySubmit={handleCategorySubmit}
              onCategoryDelete={handleDeleteCategory}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function AuthScreen({
  authMode,
  authForm,
  error,
  isSaving,
  onAuthModeChange,
  onAuthFormChange,
  onSubmit,
}: {
  authMode: AuthMode
  authForm: {
    nome: string
    email: string
    senha: string
    tipo_usuario: User['tipo_usuario']
  }
  error: string | null
  isSaving: boolean
  onAuthModeChange: (mode: AuthMode) => void
  onAuthFormChange: (value: typeof authForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <main className="grid min-h-screen bg-[#f6f7f2] text-slate-950 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex min-h-[340px] flex-col justify-between bg-slate-950 p-6 text-white sm:p-10 lg:min-h-screen">
        <Brand inverted />
        <div className="max-w-2xl py-10">
          <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-300">
            Controle financeiro pessoal
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Saldoo organiza gastos, metas e decisoes em uma rotina simples.
          </h1>
          <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-300">
            Registre receitas e despesas, acompanhe seu score e receba orientacoes com base nos
            dados reais da sua conta.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <AuthMetric label="Dashboard" value="Tempo real" />
          <AuthMetric label="Metas" value="Progresso" />
          <AuthMetric label="API" value="Laravel REST" />
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <form
          onSubmit={onSubmit}
          className="grid w-full max-w-md gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <p className="text-sm font-bold text-slate-500">
              {authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
            </p>
            <h2 className="mt-1 text-3xl font-black text-slate-950">
              {authMode === 'login' ? 'Entrar no Saldoo' : 'Comecar agora'}
            </h2>
          </div>

          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onAuthModeChange('login')}
              className={`rounded-md px-3 py-2 text-sm font-extrabold transition ${
                authMode === 'login' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onAuthModeChange('register')}
              className={`rounded-md px-3 py-2 text-sm font-extrabold transition ${
                authMode === 'register' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
              }`}
            >
              Cadastro
            </button>
          </div>

          {error && (
            <Alert tone="error" icon={ShieldCheck}>
              {error}
            </Alert>
          )}

          {authMode === 'register' && (
            <Field label="Nome">
              <input
                required
                minLength={2}
                value={authForm.nome}
                onChange={(event) => onAuthFormChange({ ...authForm, nome: event.target.value })}
                className={inputClass}
                placeholder="Seu nome"
              />
            </Field>
          )}

          <Field label="Email">
            <input
              required
              type="email"
              value={authForm.email}
              onChange={(event) => onAuthFormChange({ ...authForm, email: event.target.value })}
              className={inputClass}
              placeholder="voce@email.com"
            />
          </Field>

          <Field label="Senha">
            <input
              required
              type="password"
              minLength={authMode === 'register' ? 8 : undefined}
              value={authForm.senha}
              onChange={(event) => onAuthFormChange({ ...authForm, senha: event.target.value })}
              className={inputClass}
              placeholder={authMode === 'register' ? 'Minimo 8 caracteres' : 'Sua senha'}
            />
          </Field>

          {authMode === 'register' && (
            <Field label="Perfil">
              <select
                value={authForm.tipo_usuario}
                onChange={(event) =>
                  onAuthFormChange({
                    ...authForm,
                    tipo_usuario: event.target.value as User['tipo_usuario'],
                  })
                }
                className={inputClass}
              >
                <option value="personal">Pessoa fisica</option>
                <option value="business">Negocio</option>
              </select>
            </Field>
          )}

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
      </section>
    </main>
  )
}

function DashboardView({
  dashboard,
  score,
  history,
  transactions,
  saving,
  onTransactionDelete,
}: {
  dashboard: Dashboard | null
  score: Score | null
  history: HistoryItem[]
  transactions: Array<Transaction & { kind: TransactionKind }>
  saving: SavingAction
  onTransactionDelete: (transaction: Transaction & { kind: TransactionKind }) => void
}) {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumo financeiro">
        <MetricCard
          label="Saldo"
          value={formatMoney(dashboard?.saldo_atual ?? 0)}
          icon={WalletCards}
          tone="emerald"
        />
        <MetricCard
          label="Receitas"
          value={formatMoney(dashboard?.total_receitas ?? 0)}
          icon={TrendingUp}
          tone="blue"
        />
        <MetricCard
          label="Despesas"
          value={formatMoney(dashboard?.total_despesas ?? 0)}
          icon={TrendingDown}
          tone="rose"
        />
        <MetricCard
          label="Economia"
          value={`${Number(dashboard?.taxa_economia ?? 0).toFixed(1)}%`}
          icon={CircleDollarSign}
          tone="amber"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Historico mensal">
          <HistoryChart history={history} />
        </Panel>

        <Panel title="Score financeiro">
          {score ? (
            <div className="grid gap-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black text-slate-950">{score.score}</p>
                  <p className="mt-1 text-sm font-bold text-slate-500">{score.nivel}</p>
                </div>
                <div className="h-24 w-24 rounded-full border-[12px] border-emerald-600 bg-emerald-50" />
              </div>
              <div className="grid gap-2">
                {score.recomendacoes.slice(0, 3).map((recommendation) => (
                  <p key={recommendation} className="text-sm leading-6 text-slate-600">
                    {recommendation}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState>Registre movimentacoes para calcular seu score.</EmptyState>
          )}
        </Panel>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <Panel title="Gastos por categoria">
          <BarList items={dashboard?.distribuicao_gastos ?? []} tone="rose" />
        </Panel>
        <Panel title="Receitas por categoria">
          <BarList items={dashboard?.distribuicao_receitas ?? []} tone="emerald" />
        </Panel>
        <Panel title="Lancamentos recentes">
          <TransactionList
            transactions={transactions.slice(0, 6)}
            saving={saving}
            onDelete={onTransactionDelete}
            compact
          />
        </Panel>
      </section>
    </div>
  )
}

function TransactionsView({
  transactionForm,
  categories,
  transactions,
  saving,
  onTransactionFormChange,
  onSubmit,
  onDelete,
}: {
  transactionForm: {
    kind: TransactionKind
    valor: string
    data: string
    descricao: string
    id_categoria: string
  }
  categories: Category[]
  transactions: Array<Transaction & { kind: TransactionKind }>
  saving: SavingAction
  onTransactionFormChange: (value: typeof transactionForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onDelete: (transaction: Transaction & { kind: TransactionKind }) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
      <Panel title="Novo lancamento">
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() =>
                onTransactionFormChange({ ...transactionForm, kind: 'expense', id_categoria: '' })
              }
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
                transactionForm.kind === 'expense'
                  ? 'bg-white text-rose-700 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" aria-hidden="true" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() =>
                onTransactionFormChange({ ...transactionForm, kind: 'income', id_categoria: '' })
              }
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-extrabold transition ${
                transactionForm.kind === 'income'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />
              Receita
            </button>
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

function GoalsView({
  goalForm,
  categories,
  goals,
  saving,
  onGoalFormChange,
  onSubmit,
  onProgress,
  onDelete,
}: {
  goalForm: {
    titulo: string
    valor_alvo: string
    valor_atual: string
    data_limite: string
    id_categoria: string
  }
  categories: Category[]
  goals: Goal[]
  saving: SavingAction
  onGoalFormChange: (value: typeof goalForm) => void
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
              <article key={goal.id_meta} className="border-b border-slate-100 pb-4 last:border-0">
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
                      disabled={
                        saving === 'goal-progress' || goal.progresso_percentual >= 100
                      }
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
            ))}
          </div>
        ) : (
          <EmptyState>Crie sua primeira meta para acompanhar progresso.</EmptyState>
        )}
      </Panel>
    </section>
  )
}

function AssistantView({
  messages,
  chatInput,
  saving,
  onChatInputChange,
  onSubmit,
}: {
  messages: ChatMessage[]
  chatInput: string
  saving: SavingAction
  onChatInputChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.45fr]">
      <Panel title="Conversa">
        <div className="grid max-h-[58vh] gap-3 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 ${
                message.role === 'user'
                  ? 'ml-auto bg-slate-950 text-white'
                  : 'bg-emerald-50 text-slate-800'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={chatInput}
            onChange={(event) => onChatInputChange(event.target.value)}
            className={`${inputClass} flex-1`}
            placeholder="Ex.: Como posso economizar este mes?"
            aria-label="Mensagem para o assistente"
          />
          <Button type="submit" disabled={saving === 'chat'}>
            {saving === 'chat' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <MessageSquareText className="h-4 w-4" aria-hidden="true" />
            )}
            Enviar
          </Button>
        </form>
      </Panel>

      <Panel title="Contexto usado">
        <div className="grid gap-3 text-sm leading-6 text-slate-600">
          <p>
            O assistente responde com base no dashboard, no score e nos lancamentos registrados na
            sua conta.
          </p>
          <p>
            Para respostas melhores, mantenha receitas, despesas, metas e categorias atualizadas.
          </p>
        </div>
      </Panel>
    </section>
  )
}

function SettingsView({
  profileForm,
  passwordForm,
  categoryForm,
  categories,
  saving,
  onProfileFormChange,
  onPasswordFormChange,
  onCategoryFormChange,
  onProfileSubmit,
  onPasswordSubmit,
  onCategorySubmit,
  onCategoryDelete,
}: {
  profileForm: {
    nome: string
    email: string
    tipo_usuario: User['tipo_usuario']
  }
  passwordForm: {
    senha_atual: string
    nova_senha: string
  }
  categoryForm: {
    nome: string
    tipo: Category['tipo']
  }
  categories: Category[]
  saving: SavingAction
  onProfileFormChange: (value: typeof profileForm) => void
  onPasswordFormChange: (value: typeof passwordForm) => void
  onCategoryFormChange: (value: typeof categoryForm) => void
  onProfileSubmit: (event: FormEvent<HTMLFormElement>) => void
  onPasswordSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategorySubmit: (event: FormEvent<HTMLFormElement>) => void
  onCategoryDelete: (category: Category) => void
}) {
  const customCategories = categories.filter((category) => category.id_usuario !== null)

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <Panel title="Perfil">
        <form onSubmit={onProfileSubmit} className="grid gap-4">
          <Field label="Nome">
            <input
              required
              minLength={2}
              value={profileForm.nome}
              onChange={(event) => onProfileFormChange({ ...profileForm, nome: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              value={profileForm.email}
              onChange={(event) =>
                onProfileFormChange({ ...profileForm, email: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Tipo de conta">
            <select
              value={profileForm.tipo_usuario}
              onChange={(event) =>
                onProfileFormChange({
                  ...profileForm,
                  tipo_usuario: event.target.value as User['tipo_usuario'],
                })
              }
              className={inputClass}
            >
              <option value="personal">Pessoa fisica</option>
              <option value="business">Negocio</option>
            </select>
          </Field>
          <Button type="submit" disabled={saving === 'profile'}>
            {saving === 'profile' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserRound className="h-4 w-4" aria-hidden="true" />
            )}
            Salvar perfil
          </Button>
        </form>
      </Panel>

      <Panel title="Seguranca">
        <form onSubmit={onPasswordSubmit} className="grid gap-4">
          <Field label="Senha atual">
            <input
              required
              type="password"
              value={passwordForm.senha_atual}
              onChange={(event) =>
                onPasswordFormChange({ ...passwordForm, senha_atual: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Nova senha">
            <input
              required
              type="password"
              minLength={8}
              value={passwordForm.nova_senha}
              onChange={(event) =>
                onPasswordFormChange({ ...passwordForm, nova_senha: event.target.value })
              }
              className={inputClass}
            />
          </Field>
          <Button type="submit" disabled={saving === 'password'}>
            {saving === 'password' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            )}
            Atualizar senha
          </Button>
        </form>
      </Panel>

      <Panel title="Nova categoria">
        <form onSubmit={onCategorySubmit} className="grid gap-4">
          <Field label="Nome">
            <input
              required
              minLength={2}
              value={categoryForm.nome}
              onChange={(event) =>
                onCategoryFormChange({ ...categoryForm, nome: event.target.value })
              }
              className={inputClass}
              placeholder="Ex.: Estudos"
            />
          </Field>
          <Field label="Tipo">
            <select
              value={categoryForm.tipo}
              onChange={(event) =>
                onCategoryFormChange({
                  ...categoryForm,
                  tipo: event.target.value as Category['tipo'],
                })
              }
              className={inputClass}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
              <option value="both">Ambos</option>
            </select>
          </Field>
          <Button type="submit" disabled={saving === 'category'}>
            {saving === 'category' ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            Criar categoria
          </Button>
        </form>
      </Panel>

      <Panel title="Categorias personalizadas">
        {customCategories.length > 0 ? (
          <div className="grid gap-3">
            {customCategories.map((category) => (
              <div
                key={category.id_categoria}
                className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
              >
                <div>
                  <p className="font-black text-slate-950">{category.nome}</p>
                  <p className="text-sm font-bold text-slate-500">{category.tipo}</p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => onCategoryDelete(category)}
                  disabled={saving === 'delete'}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remover
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>As categorias padrao ja estao disponiveis para uso.</EmptyState>
        )}
      </Panel>
    </section>
  )
}

function TransactionList({
  transactions,
  saving,
  onDelete,
  compact = false,
}: {
  transactions: Array<Transaction & { kind: TransactionKind }>
  saving: SavingAction
  onDelete: (transaction: Transaction & { kind: TransactionKind }) => void
  compact?: boolean
}) {
  if (transactions.length === 0) {
    return <EmptyState>Nenhum lancamento no periodo.</EmptyState>
  }

  return (
    <div className="grid gap-3">
      {transactions.map((transaction) => {
        const isIncome = transaction.kind === 'income'
        return (
          <article
            key={`${transaction.kind}-${transaction.id}`}
            className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isIncome ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {isIncome ? (
                  <ArrowUpCircle className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">
                  {transaction.descricao || transaction.categoria_nome || transaction.tipo}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {transaction.categoria_nome ?? 'Sem categoria'} | {formatDate(transaction.data)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <p
                className={`text-right font-black ${
                  isIncome ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {isIncome ? '+' : '-'}
                {formatMoney(transaction.valor)}
              </p>
              {!compact && (
                <Button
                  variant="danger"
                  onClick={() => onDelete(transaction)}
                  disabled={saving === 'delete'}
                  className="min-h-10 px-3"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Remover</span>
                </Button>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function HistoryChart({ history }: { history: HistoryItem[] }) {
  if (history.length === 0) {
    return <EmptyState>Sem historico suficiente para o grafico.</EmptyState>
  }

  const maxValue = Math.max(
    1,
    ...history.map((item) => Math.max(item.total_receitas, item.total_despesas)),
  )

  return (
    <div className="grid gap-4">
      {history.map((item) => (
        <div key={`${item.mes}-${item.ano}`} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-extrabold text-slate-700">
              {monthName(item.mes)} {item.ano}
            </span>
            <span className="font-bold text-slate-500">{formatMoney(item.saldo)}</span>
          </div>
          <div className="grid gap-1">
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${(item.total_receitas / maxValue) * 100}%` }}
              />
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${(item.total_despesas / maxValue) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BarList({
  items,
  tone,
}: {
  items: Array<{ categoria: string; total: number }>
  tone: 'emerald' | 'rose'
}) {
  if (items.length === 0) {
    return <EmptyState>Sem dados para este periodo.</EmptyState>
  }

  const maxValue = Math.max(1, ...items.map((item) => item.total))
  const color = tone === 'emerald' ? 'bg-emerald-600' : 'bg-rose-500'

  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <div key={item.categoria} className="grid gap-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-extrabold text-slate-700">{item.categoria}</span>
            <span className="font-bold text-slate-500">{formatMoney(item.total)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${color}`}
              style={{ width: `${(item.total / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: LucideIcon
  tone: 'emerald' | 'blue' | 'rose' | 'amber'
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-sky-50 text-sky-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
  }

  return (
    <article className="summary-card rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold uppercase tracking-wide text-slate-500">{label}</p>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">{value}</p>
    </article>
  )
}

function Alert({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'success' | 'error'
  icon: LucideIcon
  children: ReactNode
}) {
  const classes =
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
      : 'border-rose-200 bg-rose-50 text-rose-900'

  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-bold ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <WalletCards className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className={`text-xl font-black ${inverted ? 'text-white' : 'text-slate-950'}`}>
          Saldoo
        </p>
        <p className={`text-xs font-bold ${inverted ? 'text-slate-300' : 'text-slate-500'}`}>
          Financas sob controle
        </p>
      </div>
    </div>
  )
}

function NavButton({
  item,
  active,
  compact = false,
  onClick,
}: {
  item: { key: View; label: string; icon: LucideIcon }
  active: boolean
  compact?: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-extrabold transition ${
        active
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      } ${compact ? 'shrink-0' : 'w-full'}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </button>
  )
}

function PageTitle({ activeView, user }: { activeView: View; user: User | null }) {
  const labels = {
    dashboard: ['Dashboard', `Ola, ${user?.nome ?? 'usuario'}. Aqui esta seu resumo.`],
    transactions: ['Lancamentos', 'Registre e acompanhe receitas e despesas do periodo.'],
    goals: ['Metas', 'Transforme planos financeiros em progresso visivel.'],
    assistant: ['Assistente', 'Receba orientacoes usando os dados da sua conta.'],
    settings: ['Ajustes', 'Gerencie perfil, seguranca e categorias.'],
  } satisfies Record<View, [string, string]>

  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-wide text-emerald-700">Saldoo</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">{labels[activeView][0]}</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">{labels[activeView][1]}</p>
      </div>
    </div>
  )
}

function AuthMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  )
}

export default App
