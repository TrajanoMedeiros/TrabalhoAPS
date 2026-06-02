import { Loader2 } from 'lucide-react'

export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] text-slate-950">
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-slate-700" aria-hidden="true" />
        <span className="font-bold">Carregando Saldoo...</span>
      </div>
    </main>
  )
}
