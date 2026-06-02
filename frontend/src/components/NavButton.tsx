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
      title={compact ? item.label : undefined}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 ${
        active
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      } ${compact ? 'w-full justify-center sm:w-auto sm:shrink-0' : 'w-full'}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {!compact && item.label}
    </button>
  )
}
