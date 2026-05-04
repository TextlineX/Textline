import { useEffect, useMemo, useRef, useState } from 'react'

import { isBrowser } from '../../utils/isBrowser'

type Point = {
  x: number
  y: number
}

type CursorSize = {
  width: number
  height: number
}

type UseMagneticCursorOptions = {
  enabled?: boolean
  targetSelector?: string
}

const defaultPoint: Point = { x: 0, y: 0 }
const defaultSize: CursorSize = { width: 64, height: 64 }

function getShellPadding(shell: string | undefined) {
  switch (shell) {
    case 'compact':
      return { x: 10, y: 10 }
    case 'tight':
      return { x: 18, y: 14 }
    case 'wide':
      return { x: 28, y: 20 }
    default:
      return { x: 24, y: 16 }
  }
}

export function useMagneticCursor({
  enabled = true,
  targetSelector = '.magnetic-target',
}: UseMagneticCursorOptions = {}) {
  const [position, setPosition] = useState<Point>(defaultPoint)
  const [size, setSize] = useState<CursorSize>(defaultSize)
  const [locked, setLocked] = useState(false)
  const [avatarActive, setAvatarActive] = useState(false)

  const pointerRef = useRef<Point>(defaultPoint)
  const cursorRef = useRef<Point>(defaultPoint)
  const currentTargetRef = useRef<HTMLElement | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!enabled || !isBrowser()) {
      return
    }

    const move = (event: MouseEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY }
    }

    const bindTargets = () => {
      const targets = Array.from(document.querySelectorAll<HTMLElement>(targetSelector))

      const handleEnter = (event: Event) => {
        const target = event.currentTarget as HTMLElement | null
        if (!target) {
          return
        }

        currentTargetRef.current = target
        setLocked(true)
        const isAvatarTarget = target.dataset.avatarTrigger === 'true'
        setAvatarActive(isAvatarTarget)
        const shell = target.dataset.magneticShell
        const padding = getShellPadding(shell)

        const rect = target.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        cursorRef.current = { x: centerX, y: centerY }
        setPosition({ x: centerX, y: centerY })
        setSize({
          width: rect.width + padding.x,
          height: rect.height + padding.y,
        })
      }

      const handleLeave = () => {
        currentTargetRef.current = null
        setLocked(false)
        setAvatarActive(false)
        setSize(defaultSize)
      }

      targets.forEach((target) => {
        target.addEventListener('pointerenter', handleEnter)
        target.addEventListener('pointerleave', handleLeave)
      })

      return () => {
        targets.forEach((target) => {
          target.removeEventListener('pointerenter', handleEnter)
          target.removeEventListener('pointerleave', handleLeave)
        })
      }
    }

    const unbindTargets = bindTargets()

    const tick = () => {
      const pointer = pointerRef.current
      let nextX = pointer.x
      let nextY = pointer.y

      if (currentTargetRef.current) {
        const rect = currentTargetRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        nextX = centerX
        nextY = centerY
      }

      cursorRef.current = {
        x: nextX,
        y: nextY,
      }

      setPosition({ ...cursorRef.current })
      frameRef.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', move as unknown as EventListener, { passive: true })
    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameRef.current)
      window.removeEventListener('pointermove', move as unknown as EventListener)
      unbindTargets?.()
    }
  }, [enabled, targetSelector])

  return useMemo(
    () => ({
      position,
      locked,
      avatarActive,
      size,
      setLocked,
    }),
    [avatarActive, locked, position, size],
  )
}
