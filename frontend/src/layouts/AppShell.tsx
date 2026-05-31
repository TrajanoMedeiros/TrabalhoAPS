import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Alert } from '../components/Alert'
import { Brand } from '../components/Brand'
import { SelectInput } from '../components/form/SelectInput'
import { MobileNav } from '../components/MobileNav'
import { NavButton } from '../components/NavButton'
import { PageTitle } from '../components/PageTitle'
import { Button } from '../components/ui'
import { navItems } from '../routes/navigation'
import type { Dashboard, User, View } from '../types'
import { formatMoney, monthName } from '../utils/format'

const sidebarStorageKey = 'saldoo.layout.sidebar-collapsed'

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(sidebarStorageKey) === '1'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileHeaderHidden, setMobileHeaderHidden] = useState(false)
  const lastScrollRef = useRef(0)
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => index + 1).map((option) => ({
        value: option,
        label: monthName(option),
      })),
    [],
  )
  const yearOptions = useMemo(
    () =>
      years.map((option) => ({
        value: option,
        label: String(option),
      })),
    [years],
  )

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY
      const delta = currentScroll - lastScrollRef.current

      if (mobileMenuOpen) setMobileMenuOpen(false)

      if (window.innerWidth >= 1024 || currentScroll < 24) {
        setMobileHeaderHidden(false)
        lastScrollRef.current = currentScroll
        return
      }

      if (delta > 8 && currentScroll > 96) setMobileHeaderHidden(true)
      if (delta < -8) setMobileHeaderHidden(false)
      lastScrollRef.current = currentScroll
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false)
        setMobileHeaderHidden(false)
      }
    }

    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [mobileMenuOpen])

  function handleMobileViewChange(view: View) {
    onViewChange(view)
    setMobileMenuOpen(false)
    setMobileHeaderHidden(false)
  }

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current
      window.localStorage.setItem(sidebarStorageKey, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white px-3 py-5 transition-[width,padding] duration-300 lg:flex ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <Brand compact={sidebarCollapsed} />
          <button
            type="button"
            aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            onClick={toggleSidebar}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        <nav className="mt-8 grid gap-2" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeView === item.key}
              compact={sidebarCollapsed}
              onClick={() => onViewChange(item.key)}
            />
          ))}
        </nav>
        <div className={`mt-auto rounded-lg border border-emerald-100 bg-emerald-50 p-4 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {!sidebarCollapsed && (
            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
              Saldo atual
            </p>
          )}
          <p className={`font-black text-slate-950 ${sidebarCollapsed ? 'text-sm' : 'mt-2 text-2xl'}`}>
            {sidebarCollapsed ? formatMoney(dashboard?.saldo_atual ?? 0).replace('R$', '').trim() : formatMoney(dashboard?.saldo_atual ?? 0)}
          </p>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <div className={`relative z-0 transition-[padding] duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <header
          className={`sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl transition-transform duration-300 ease-out lg:translate-y-0 ${
            mobileHeaderHidden ? '-translate-y-full' : 'translate-y-0'
          }`}
        >
          <div className="mx-auto grid max-w-7xl gap-3 px-4 py-3 sm:px-6 lg:flex lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <Brand />
              <div className="flex min-w-0 items-center gap-2">
                <div className="w-24 shrink-0 rounded-2xl bg-slate-100 px-3 py-2 text-right">
                  <p className="truncate text-[10px] font-extrabold uppercase text-slate-500">
                    Periodo
                  </p>
                  <p className="truncate text-sm font-black text-slate-950">
                    {monthName(month)} {year}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                  aria-expanded={mobileMenuOpen}
                  onClick={() => {
                    setMobileHeaderHidden(false)
                    setMobileMenuOpen((current) => !current)
                  }}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-950 text-white shadow-sm transition duration-200 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 active:scale-95"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-500">Periodo selecionado</p>
                <h1 className="text-2xl font-black text-slate-950">
                  {monthName(month)} de {year}
                </h1>
            </div>

            <div className="hidden gap-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end">
              <SelectInput
                ariaLabel="Mes do periodo"
                value={month}
                onChange={onMonthChange}
                className="min-h-11 sm:w-auto sm:min-w-28"
                options={monthOptions}
              />
              <SelectInput
                ariaLabel="Ano do periodo"
                value={year}
                onChange={onYearChange}
                className="min-h-11 sm:w-auto sm:min-w-24"
                options={yearOptions}
              />
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
          </div>

          <div
            className={`absolute left-0 right-0 top-full px-4 transition duration-300 ease-out sm:px-6 lg:hidden ${
              mobileMenuOpen
                ? 'pointer-events-auto translate-y-2 opacity-100'
                : 'pointer-events-none -translate-y-2 opacity-0'
            }`}
          >
            <div className="mx-auto grid max-h-[calc(100vh-6rem)] max-w-md gap-3 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/15 ring-1 ring-slate-950/5">
              <div className="grid grid-cols-2 gap-2">
                <SelectInput
                  ariaLabel="Mes do periodo"
                  value={month}
                  onChange={onMonthChange}
                  options={monthOptions}
                />
                <SelectInput
                  ariaLabel="Ano do periodo"
                  value={year}
                  onChange={onYearChange}
                  options={yearOptions}
                />
                <Button
                  variant="ghost"
                  onClick={onRefresh}
                  disabled={loading}
                  className="min-h-11"
                >
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
              <MobileNav activeView={activeView} onViewChange={handleMobileViewChange} />
            </div>
          </div>
        </header>

        <main className="surface-enter mx-auto grid w-full min-w-0 max-w-7xl gap-5 overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
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
