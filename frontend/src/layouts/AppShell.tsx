import type { ReactNode } from 'react'
import { CalendarDays, CheckCircle2, Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { Alert } from '../components/Alert'
import { Brand } from '../components/Brand'
import { MobileNav } from '../components/MobileNav'
import { NavButton } from '../components/NavButton'
import { PageTitle } from '../components/PageTitle'
import { Button } from '../components/ui'
import { navItems } from '../routes/navigation'
import { inputClass } from '../styles/tokens'
import type { Dashboard, User, View } from '../types'
import { formatMoney, monthName } from '../utils/format'

export function AppShell({
  activeView,
  user,
  dashboard,
  month,
  year,
  years,
  loading,
  error,
  notice,
  children,
  onMonthChange,
  onYearChange,
  onRefresh,
  onLogout,
  onViewChange,
}: {
  activeView: View
  user: User | null
  dashboard: Dashboard | null
  month: number
  year: number
  years: number[]
  loading: boolean
  error: string | null
  notice: string | null
  children: ReactNode
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onRefresh: () => void
  onLogout: () => void
  onViewChange: (view: View) => void
}) {
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
              onClick={() => onViewChange(item.key)}
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
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="shrink-0 lg:hidden">
                <Brand />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-500">Periodo selecionado</p>
                <h1 className="text-2xl font-black text-slate-950">
                  {monthName(month)} de {year}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <select
                aria-label="Mes"
                value={month}
                onChange={(event) => onMonthChange(Number(event.target.value))}
                className={`${inputClass} min-h-11 sm:w-auto sm:min-w-28`}
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
                onChange={(event) => onYearChange(Number(event.target.value))}
                className={`${inputClass} min-h-11 sm:w-auto sm:min-w-24`}
              >
                {years.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Button variant="ghost" onClick={onRefresh} disabled={loading} className="min-h-11">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />
                )}
                Atualizar
              </Button>
              <Button variant="danger" onClick={onLogout} className="min-h-11">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </Button>
            </div>

            <MobileNav activeView={activeView} onViewChange={onViewChange} />
          </div>
        </header>

        <main className="surface-enter mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
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

          {children}
        </main>
      </div>
    </div>
  )
}
