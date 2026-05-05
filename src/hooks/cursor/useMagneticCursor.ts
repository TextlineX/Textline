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
      return { x: 16, y: 14 }
    case 'tight':
      return { x: 26, y: 20 }
    case 'wide':
      return { x: 38, y: 28 }
    default:
      return { x: 30, y: 22 }
  }
}

function setMagneticActive(target: HTMLElement | null, active: boolean) {
  if (!target) {
    return
  }

  target.classList.toggle('magnetic-target--active', active)
  if (active) {
    target.setAttribute('data-magnetic-active', 'true')
  } else {
    target.removeAttribute('data-magnetic-active')
  }
}

function getTargetFromPoint(point: Point, targetSelector: string) {
  if (!isBrowser()) {
    return null
  }

  const element = document.elementFromPoint(point.x, point.y)
  const hitTarget = element?.closest(targetSelector) as HTMLElement | null
  if (hitTarget) {
    return hitTarget
  }

  const targets = Array.from(document.querySelectorAll<HTMLElement>(targetSelector))
  for (const target of targets) {
    const rect = target.getBoundingClientRect()
    if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
      return target
    }
  }

  return null
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

    const tick = () => {
      const pointer = pointerRef.current
      const nextTarget = getTargetFromPoint(pointer, targetSelector)

      if (nextTarget !== currentTargetRef.current) {
        setMagneticActive(currentTargetRef.current, false)
        currentTargetRef.current = nextTarget
        setMagneticActive(nextTarget, true)
        setLocked(Boolean(nextTarget))

        const isAvatarTarget = nextTarget?.dataset.avatarTrigger === 'true'
        setAvatarActive(isAvatarTarget)

        if (nextTarget) {
          const shell = nextTarget.dataset.magneticShell
          const padding = getShellPadding(shell)
          const rect = nextTarget.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          cursorRef.current = { x: centerX, y: centerY }
          setPosition({ x: centerX, y: centerY })
          setSize({
            width: rect.width + padding.x,
            height: rect.height + padding.y,
          })
        } else {
          setSize(defaultSize)
        }
      }

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
      setMagneticActive(currentTargetRef.current, false)
      currentTargetRef.current = null
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
