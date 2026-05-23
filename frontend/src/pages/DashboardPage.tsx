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
            <p className="text-slate-500">Registre movimentacoes para calcular seu score.</p>
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
