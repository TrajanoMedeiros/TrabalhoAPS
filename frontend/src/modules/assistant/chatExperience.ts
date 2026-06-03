import type { ChatMessage, Dashboard, Score } from '../../types'
import { formatMoney } from '../../utils/format'

type Context = {
  dashboard: Dashboard | null
  score: Score | null
}

export function createChatMessage(
  role: ChatMessage['role'],
  content: string,
  createdAt = new Date().toISOString(),
): ChatMessage {
  return { role, content, createdAt }
}

export function buildAssistantWelcomeMessage({ dashboard, score }: Context): string {
  if (!dashboard || !score) {
    return 'Ola, sou seu assistente financeiro. Posso ajudar voce a entender seus gastos, metas, categorias e indicadores financeiros.'
  }

  const topExpense = dashboard.distribuicao_gastos[0]?.categoria

  return [
    `Ola, sou seu assistente financeiro. Seu saldo atual no periodo esta em ${formatMoney(dashboard.saldo_atual)}.`,
    `Seu score financeiro esta em ${score.score} (${score.nivel}).`,
    topExpense ? `A categoria com maior gasto ate agora e "${topExpense}".` : null,
    'Posso te ajudar com gastos, metas, categorias e proximos passos de melhoria.',
  ]
    .filter(Boolean)
    .join(' ')
}

export function buildAssistantSuggestions({ dashboard, score }: Context): string[] {
  const suggestions: string[] = []
  const topExpense = dashboard?.distribuicao_gastos[0]?.categoria

  if (dashboard) {
    suggestions.push('Quanto gastei no periodo atual?')

    if (topExpense) {
      suggestions.push(`Como reduzir gastos em ${topExpense}?`)
      suggestions.push('Qual categoria mais consumiu meu orcamento?')
    }

    if (dashboard.metas.total > 0) {
      suggestions.push('Como estao minhas metas financeiras?')
    } else {
      suggestions.push('Que meta devo criar primeiro?')
    }
  }

  if (score) {
    suggestions.push(`Como posso melhorar meu score ${score.score}?`)
  }

  suggestions.push('Me de um resumo financeiro rapido.')

  return Array.from(new Set(suggestions)).slice(0, 4)
}

export function buildLocalAssistantReply(
  question: string,
  { dashboard, score }: Context,
): string {
  const normalized = normalize(question)

  if (!dashboard || !score) {
    return 'Estou no modo local agora. Mesmo sem API, posso te orientar com planejamento de gastos, metas e score para o proximo periodo.'
  }

  if (includesAny(normalized, ['gastei', 'despesa', 'despesas', 'gastos'])) {
    return `No periodo atual, suas despesas somam ${formatMoney(dashboard.total_despesas)}. Quer que eu sugira um plano para reduzir isso nas principais categorias?`
  }

  if (includesAny(normalized, ['recebi', 'receita', 'receitas', 'ganhei'])) {
    return `No periodo atual, suas receitas somam ${formatMoney(dashboard.total_receitas)} e seu saldo esta em ${formatMoney(dashboard.saldo_atual)}.`
  }

  if (includesAny(normalized, ['meta', 'metas', 'objetivo'])) {
    if (dashboard.metas.total === 0) {
      return 'Voce ainda nao tem metas ativas. Uma boa primeira meta e reserva de emergencia com aporte mensal fixo.'
    }

    return `Voce tem ${dashboard.metas.total} metas ativas com progresso geral de ${dashboard.metas.progresso_percentual.toFixed(1)}%.`
  }

  if (includesAny(normalized, ['categoria', 'categorias']) && includesAny(normalized, ['mais', 'maior', 'top'])) {
    const topExpense = dashboard.distribuicao_gastos[0]

    if (!topExpense) {
      return 'Ainda nao ha dados suficientes por categoria neste periodo. Assim que houver lancamentos eu te mostro onde esta a maior concentracao.'
    }

    return `Sua categoria de maior gasto e "${topExpense.categoria}" com ${formatMoney(topExpense.total)}. Esse e o melhor ponto para ajustes rapidos.`
  }

  if (includesAny(normalized, ['score', 'pontuacao'])) {
    const recommendation =
      score.recomendacoes[0] ??
      'Mantenha despesas abaixo da renda e acompanhe metas mensalmente para evoluir score.'

    return `Seu score atual e ${score.score} (${score.nivel}). Principal recomendacao: ${recommendation}`
  }

  return [
    `Resumo rapido local: saldo ${formatMoney(dashboard.saldo_atual)},`,
    `receitas ${formatMoney(dashboard.total_receitas)},`,
    `despesas ${formatMoney(dashboard.total_despesas)} e score ${score.score} (${score.nivel}).`,
    'Posso detalhar gastos por categoria, metas ou plano de melhoria.',
  ].join(' ')
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value))
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
