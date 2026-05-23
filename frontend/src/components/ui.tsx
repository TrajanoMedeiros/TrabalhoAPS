import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function Button({
  children,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#22c55e] text-white hover:bg-[#16a34a]',
    secondary: 'bg-slate-950 text-white hover:bg-slate-800',
    ghost: 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
    danger: 'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-600">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Panel({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-extrabold text-slate-950">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="text-slate-500">{children}</p>
}
