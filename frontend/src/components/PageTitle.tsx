import type { User, View } from '../types'

export function PageTitle({ activeView, user }: { activeView: View; user: User | null }) {
  const labels = {
    dashboard: ['Dashboard', `Olá, ${user?.nome ?? 'usuário'}. Aqui está seu resumo.`],
    transactions: ['Lançamentos', 'Registre e acompanhe receitas e despesas do período.'],
    goals: ['Metas', 'Transforme planos financeiros em progresso visível.'],
    assistant: ['Assistente', 'Receba orientações usando os dados da sua conta.'],
    settings: ['Ajustes', 'Gerencie perfil, segurança e categorias.'],
  } satisfies Record<View, [string, string]>

  return (
    <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 max-w-full">
        <p className="text-sm font-extrabold uppercase tracking-wide text-sky-700">Saldoo</p>
        <h1 className="mt-1 break-words text-3xl font-black text-slate-950">
          {labels[activeView][0]}
        </h1>
        <p className="mt-1 break-words text-sm font-medium text-slate-500">
          {labels[activeView][1]}
        </p>
      </div>
    </div>
  )
}
