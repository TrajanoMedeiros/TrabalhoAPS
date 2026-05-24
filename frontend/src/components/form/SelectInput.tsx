import { useCallback, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { useFloatingOverlay } from '../../hooks/useFloatingOverlay'
import { inputButtonClass } from '../../styles/tokens'

export type SelectOption<T extends string | number> = {
  value: T
  label: string
}

export function SelectInput<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = 'Selecione',
  className = '',
  disabled = false,
}: {
  value: T
  options: Array<SelectOption<T>>
  onChange: (value: T) => void
  ariaLabel: string
  placeholder?: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  )
  const close = useCallback(() => setOpen(false), [])
  const style = useFloatingOverlay({
    open,
    anchorRef: buttonRef,
    overlayRef,
    onClose: close,
  })

  function selectOption(option: SelectOption<T>) {
    onChange(option.value)
    setOpen(false)
    window.requestAnimationFrame(() => buttonRef.current?.focus())
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`${inputButtonClass} justify-between ${className}`}
      >
        <span className={selectedOption ? 'truncate' : 'truncate text-slate-400'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-500 transition duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open &&
        style &&
        createPortal(
          <div
            ref={overlayRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            style={{
              left: style.left,
              top: style.top,
              width: style.width,
              maxHeight: style.maxHeight,
            }}
            className="fixed z-50 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10 ring-1 ring-slate-950/5 animate-overlay-in"
          >
            {options.map((option) => {
              const selected = option.value === value

              return (
                <button
                  key={`${option.value}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectOption(option)}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-extrabold transition duration-150 ${
                    selected
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {selected && <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </>
  )
}
