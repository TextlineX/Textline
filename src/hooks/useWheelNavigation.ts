import { useEffect, useRef } from 'react'

import { isBrowser } from '../utils/isBrowser'

export type WheelDirection = 'up' | 'down'

type UseWheelNavigationOptions = {
  enabled?: boolean
  delayMs?: number
  onStep: (direction: WheelDirection) => void
}

export function useWheelNavigation({
  enabled = false,
  delayMs = 180,
  onStep,
}: UseWheelNavigationOptions) {
  const onStepRef = useRef(onStep)
  const timerRef = useRef<number | undefined>(undefined)
  const pendingDirectionRef = useRef<WheelDirection | null>(null)

  useEffect(() => {
    onStepRef.current = onStep
  }, [onStep])

  useEffect(() => {
    if (!enabled || !isBrowser()) {
      return
    }

    const clearPending = () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current)
        timerRef.current = undefined
      }
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) {
        return
      }

      pendingDirectionRef.current = event.deltaY > 0 ? 'down' : 'up'
      clearPending()

      timerRef.current = window.setTimeout(() => {
        const direction = pendingDirectionRef.current
        pendingDirectionRef.current = null
        timerRef.current = undefined

        if (direction) {
          onStepRef.current(direction)
        }
      }, delayMs)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      clearPending()
      pendingDirectionRef.current = null
      window.removeEventListener('wheel', handleWheel)
    }
  }, [delayMs, enabled])
}
