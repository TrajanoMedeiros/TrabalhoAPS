import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'

type OverlayStyle = {
  left: number
  top: number
  width: number
  maxHeight: number
}

const viewportPadding = 12

export function useFloatingOverlay({
  open,
  anchorRef,
  overlayRef,
  onClose,
  minWidth = 220,
  maxWidth = 360,
}: {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  overlayRef: RefObject<HTMLElement | null>
  onClose: () => void
  minWidth?: number
  maxWidth?: number
}) {
  const [style, setStyle] = useState<OverlayStyle | null>(null)
  const rafRef = useRef<number | null>(null)

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const rect = anchor.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const overlayHeight = overlayRef.current?.getBoundingClientRect().height ?? 280
    const width = Math.min(Math.max(rect.width, minWidth), maxWidth, viewportWidth - viewportPadding * 2)
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, viewportWidth - width - viewportPadding),
    )

    const spaceBelow = viewportHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding
    const placeAbove = spaceBelow < 220 && spaceAbove > spaceBelow
    const maxHeight = Math.max(
      180,
      Math.min(360, (placeAbove ? spaceAbove : spaceBelow) - viewportPadding),
    )
    const top = placeAbove
      ? Math.max(viewportPadding, rect.top - Math.min(overlayHeight, maxHeight) - 8)
      : Math.min(rect.bottom + 8, viewportHeight - viewportPadding - Math.min(overlayHeight, maxHeight))

    setStyle({ left, top, width, maxHeight })
  }, [anchorRef, maxWidth, minWidth, overlayRef])

  useLayoutEffect(() => {
    if (!open) {
      return undefined
    }

    updatePosition()
    rafRef.current = window.requestAnimationFrame(updatePosition)

    const closeOnScroll = () => onClose()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (anchorRef.current?.contains(target) || overlayRef.current?.contains(target)) return
      onClose()
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', closeOnScroll, { passive: true })
    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsidePointer)

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', closeOnScroll)
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
    }
  }, [anchorRef, onClose, open, overlayRef, updatePosition])

  return style
}
