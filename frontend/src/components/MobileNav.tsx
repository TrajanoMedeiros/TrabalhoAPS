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
      className="grid grid-cols-5 gap-1 lg:hidden"
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
            className={`grid min-h-12 min-w-0 place-items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-extrabold transition duration-200 sm:inline-flex sm:gap-2 sm:text-sm ${
              active
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="truncate sm:hidden">{item.mobileLabel}</span>
            <span className="hidden truncate sm:inline">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
