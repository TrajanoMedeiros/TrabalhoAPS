import { navItems } from '../routes/navigation'
import type { View } from '../types'

export function MobileNav({
  activeView,
  onViewChange,
}: {
  activeView: View
  onViewChange: (view: View) => void
}) {
  return (
    <nav
      className="grid gap-1.5 xl:hidden"
      aria-label="Navegacao principal"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const active = activeView === item.key

        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => onViewChange(item.key)}
            className={`inline-flex min-h-11 min-w-0 items-center justify-start gap-3 rounded-2xl px-3 text-sm font-extrabold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              active
                ? 'bg-slate-950 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
