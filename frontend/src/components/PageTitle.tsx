import type { User, View } from '../types'

export function PageTitle({ activeView, user }: { activeView: View; user: User | null }) {
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
