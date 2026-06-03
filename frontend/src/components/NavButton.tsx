import type { NavigationItem } from '../routes/navigation'

export function NavButton({
  item,
  active,
  compact = false,
  onClick,
}: {
  item: NavigationItem
  active: boolean
  compact?: boolean
  onClick: () => void
}) {
  const Icon = item.icon

  return (
    <button
      type="button"
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`group relative inline-flex min-w-0 items-center gap-3 rounded-2xl text-sm font-extrabold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
        compact ? 'mx-auto h-12 w-12 justify-center px-0' : 'w-full justify-start px-3 py-3'
      } ${
        active
          ? 'bg-slate-100 text-slate-950 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!compact && <span className="truncate">{item.label}</span>}
      {compact && (
        <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          {item.label}
        </span>
      )}
    </button>
  )
}
