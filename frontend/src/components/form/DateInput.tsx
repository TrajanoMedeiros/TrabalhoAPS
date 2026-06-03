import { useCallback, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useFloatingOverlay } from '../../hooks/useFloatingOverlay'
import { inputButtonClass } from '../../styles/tokens'
import { formatDate, monthName } from '../../utils/format'

const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function parseDate(value: string) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null

  return new Date(year, month - 1, day)
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function DateInput({
  value,
  onChange,
  ariaLabel,
  placeholder = 'Selecione a data',
  required = false,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  placeholder?: string
  required?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const selectedDate = useMemo(() => parseDate(value), [value])
  const [visibleDate, setVisibleDate] = useState(() => selectedDate ?? new Date())
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const close = useCallback(() => setOpen(false), [])
  const style = useFloatingOverlay({
    open,
    anchorRef: buttonRef,
    overlayRef,
    onClose: close,
    minWidth: 300,
    maxWidth: 332,
  })

  const days = useMemo(() => {
    const year = visibleDate.getFullYear()
    const month = visibleDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const totalDays = new Date(year, month + 1, 0).getDate()
    const blanks = Array.from({ length: firstDay.getDay() }, (_, index) => `blank-${index}`)
    const monthDays = Array.from({ length: totalDays }, (_, index) => new Date(year, month, index + 1))

    return { blanks, monthDays }
  }, [visibleDate])

  function moveMonth(offset: number) {
    setVisibleDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function selectDate(date: Date) {
    onChange(toDateValue(date))
    setOpen(false)
    window.requestAnimationFrame(() => buttonRef.current?.focus())
  }

  function clearDate() {
    onChange('')
    setOpen(false)
    window.requestAnimationFrame(() => buttonRef.current?.focus())
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open) setVisibleDate(selectedDate ?? new Date())
          setOpen((current) => !current)
        }}
        className={`${inputButtonClass} justify-between ${className}`}
      >
        <span className={value ? 'truncate' : 'truncate text-slate-400'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
      </button>

      {open &&
        style &&
        createPortal(
          <div
            ref={overlayRef}
            role="dialog"
            aria-label={ariaLabel}
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              maxHeight: style.maxHeight,
            }}
            className="fixed z-50 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-950/10 ring-1 ring-slate-950/5 animate-overlay-in"
          >
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="text-sm font-black text-slate-950">
                {monthName(visibleDate.getMonth() + 1)} {visibleDate.getFullYear()}
              </p>
              <button
                type="button"
                onClick={() => moveMonth(1)}
                className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-slate-400">
              {weekdayLabels.map((label, index) => (
                <span key={`${label}-${index}`} className="py-1">
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.blanks.map((blank) => (
                <span key={blank} aria-hidden="true" />
              ))}
              {days.monthDays.map((day) => {
                const selected = selectedDate ? sameDay(day, selectedDate) : false
                const today = sameDay(day, new Date())

                return (
                  <button
                    key={toDateValue(day)}
                    type="button"
                    onClick={() => selectDate(day)}
                    className={`grid h-10 place-items-center rounded-xl text-sm font-extrabold transition ${
                      selected
                        ? 'bg-slate-950 text-white shadow-sm'
                        : today
                          ? 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            {!required && (
              <button
                type="button"
                onClick={clearDate}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Limpar data
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}
