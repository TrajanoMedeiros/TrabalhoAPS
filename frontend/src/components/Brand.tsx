import { WalletCards } from 'lucide-react'

export function Brand({ inverted = false }: { inverted?: boolean }) {
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
