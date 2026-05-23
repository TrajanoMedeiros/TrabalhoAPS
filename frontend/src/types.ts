export type User = {
  id_usuario: number
  nome: string
  email: string
  tipo_usuario: 'personal' | 'business'
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
