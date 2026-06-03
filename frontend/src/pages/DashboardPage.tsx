import { CircleDollarSign, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import { Panel } from '../components/ui'
import { BarList } from '../components/finance/BarList'
import { HistoryChart } from '../components/finance/HistoryChart'
import { MetricCard } from '../components/finance/MetricCard'
import { TransactionList } from '../components/finance/TransactionList'
import type { Dashboard, HistoryItem, SavingAction, Score, TransactionWithKind } from '../types'
import { formatMoney } from '../utils/format'

export function DashboardPage({
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
  transactions: TransactionWithKind[]
  saving: SavingAction
  onTransactionDelete: (transaction: TransactionWithKind) => void
}) {
  const topExpense = dashboard?.distribuicao_gastos[0]
  const topIncome = dashboard?.distribuicao_receitas[0]

  return (
    <div className="grid min-w-0 gap-5">
      <section
        className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo financeiro"
      >
        <MetricCard
          label="Saldo"
          value={formatMoney(dashboard?.saldo_atual ?? 0)}
          icon={WalletCards}
          tone="sky"
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

      <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <QuickInsightCard
          question="Como estou financeiramente?"
          answer={`Saldo atual de ${formatMoney(dashboard?.saldo_atual ?? 0)}.`}
        />
        <QuickInsightCard
          question="O que mudou?"
          answer={
            dashboard
              ? `${Number(dashboard.taxa_economia).toFixed(1)}% de economia no período atual.`
              : 'Registre movimentações para calcular variação do período.'
          }
        />
        <QuickInsightCard
          question="Onde estou gastando mais?"
          answer={
            topExpense
              ? `${topExpense.categoria}: ${formatMoney(topExpense.total)}.`
              : 'Ainda sem gastos suficientes para identificar principal categoria.'
          }
        />
        <QuickInsightCard
          question="Minhas metas estão evoluindo?"
          answer={
            dashboard?.metas.total
              ? `${dashboard.metas.progresso_percentual.toFixed(1)}% de progresso agregado em ${dashboard.metas.total} metas.`
              : 'Nenhuma meta ativa no momento. Crie sua primeira meta em Metas.'
          }
        />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Histórico mensal">
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
                <div className="h-24 w-24 rounded-full border-[12px] border-sky-600 bg-sky-50" />
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
            <p className="text-slate-500">Registre movimentações para calcular seu score.</p>
          )}
        </Panel>
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-3">
        <Panel title="Gastos por categoria">
          <BarList items={dashboard?.distribuicao_gastos ?? []} tone="rose" />
        </Panel>
        <Panel title="Receitas por categoria">
          <BarList items={dashboard?.distribuicao_receitas ?? []} tone="sky" />
        </Panel>
        <Panel title="Lançamentos recentes">
          <TransactionList
            transactions={transactions.slice(0, 6)}
            saving={saving}
            onDelete={onTransactionDelete}
            compact
          />
        </Panel>
      </section>

      {(topIncome || topExpense) && (
        <section className="grid min-w-0 gap-4 lg:grid-cols-2">
          <Panel title="Leitura rápida de categorias">
            <div className="grid gap-3 text-sm text-slate-600">
              <p>
                <span className="font-extrabold text-slate-900">Maior receita:</span>{' '}
                {topIncome
                  ? `${topIncome.categoria} (${formatMoney(topIncome.total)})`
                  : 'Sem dados no período.'}
              </p>
              <p>
                <span className="font-extrabold text-slate-900">Maior despesa:</span>{' '}
                {topExpense
                  ? `${topExpense.categoria} (${formatMoney(topExpense.total)})`
                  : 'Sem dados no período.'}
              </p>
            </div>
          </Panel>
          <Panel title="Próximo melhor passo">
            <p className="text-sm leading-6 text-slate-600">
              {score?.recomendacoes[0] ??
                'Continue registrando receitas, despesas e metas para liberar recomendações personalizadas.'}
            </p>
          </Panel>
        </section>
      )}
    </div>
  )
}

function QuickInsightCard({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{question}</p>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">{answer}</p>
    </article>
  )
}
