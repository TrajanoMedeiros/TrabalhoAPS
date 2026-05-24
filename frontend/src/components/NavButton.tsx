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
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition duration-200 ${
        active
          ? 'bg-slate-950 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
      } ${compact ? 'w-full justify-start sm:w-auto sm:shrink-0' : 'w-full'}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </button>
  )
}
