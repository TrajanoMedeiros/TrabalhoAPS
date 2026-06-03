export type User = {
  id_usuario: number
  nome: string
  email: string
  tipo_usuario: 'personal' | 'business'
  papel: 'admin' | 'user'
}

export type Category = {
  id_categoria: number
  nome: string
  tipo: 'income' | 'expense' | 'both'
  id_usuario: number | null
}

export type Transaction = {
  id: number
  tipo: 'receita' | 'despesa'
  valor: number
  data: string
  descricao: string | null
  id_categoria: number
  categoria_nome: string | null
  created_at: string | null
  kind?: 'income' | 'expense'
}

export type Goal = {
  id_meta: number
  titulo: string
  valor_alvo: number
  valor_atual: number
  progresso_percentual: number
  data_limite: string | null
  id_categoria: number | null
  categoria_nome: string | null
}

export type Dashboard = {
  saldo_atual: number
  total_receitas: number
  total_despesas: number
  taxa_economia: number
  distribuicao_gastos: Array<{ categoria: string; total: number }>
  distribuicao_receitas: Array<{ categoria: string; total: number }>
  metas: {
    total: number
    valor_alvo_total: number
    valor_atual_total: number
    progresso_percentual: number
  }
  transacoes_recentes: Transaction[]
}

export type Score = {
  score: number
  nivel: string
  details: {
    total_receitas: number
    total_despesas: number
    saldo: number
    metas_concluidas: number
    metas_total: number
  }
  recomendacoes: string[]
  sinais: string[]
}

export type HistoryItem = {
  mes: number
  ano: number
  total_receitas: number
  total_despesas: number
  saldo: number
}

export type AuthMode = 'login' | 'register'

export type View = 'dashboard' | 'transactions' | 'goals' | 'assistant' | 'settings'

export type TransactionKind = 'income' | 'expense'

export type SavingAction =
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

export type AuthPayload = {
  user: User
  token: string
  expires_at: string
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type ChatPayload = {
  chat: {
    resposta: string
    contexto: {
      saldo_atual: number
      total_receitas: number
      total_despesas: number
      score: number
      nivel: string
      [key: string]: unknown
    }
  }
}

export type AuthForm = {
  nome: string
  email: string
  senha: string
  tipo_usuario: User['tipo_usuario']
}

export type TransactionForm = {
  kind: TransactionKind
  valor: string
  data: string
  descricao: string
  id_categoria: string
}

export type GoalForm = {
  titulo: string
  valor_alvo: string
  valor_atual: string
  data_limite: string
  id_categoria: string
}

export type CategoryForm = {
  nome: string
  tipo: Category['tipo']
}

export type ProfileForm = {
  nome: string
  email: string
  tipo_usuario: User['tipo_usuario']
}

export type PasswordForm = {
  senha_atual: string
  nova_senha: string
}

export type TransactionWithKind = Transaction & { kind: TransactionKind }
