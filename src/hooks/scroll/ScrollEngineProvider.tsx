import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react'

export type ScrollScopeRegistration = {
  id: string
  enabled?: boolean
  touchEnabled?: boolean
  sensitivity?: number
  damping?: number
  clamp?: [number, number]
  getElement: () => HTMLElement | null
  onProgress?: (progress: number) => void
  onLockChange?: (locked: boolean) => void
}

type ScrollScopeRuntime = {
  id: string
  enabled: boolean
  touchEnabled: boolean
  sensitivity: number
  damping: number
  minProgress: number
  maxProgress: number
  targetProgress: number
  currentProgress: number
  locked: boolean
  getElement: () => HTMLElement | null
  onProgress?: (progress: number) => void
  onLockChange?: (locked: boolean) => void
}

type ScrollEngineContextValue = {
  registerScope: (registration: ScrollScopeRegistration) => () => void
  activateScope: (id: string | null) => void
  getActiveScopeId: () => string | null
}

const ScrollEngineContext = createContext<ScrollEngineContextValue | null>(null)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

export function ScrollEngineProvider({ children }: { children: ReactNode }) {
  const scopesRef = useRef(new Map<string, ScrollScopeRuntime>())
  const activeScopeIdRef = useRef<string | null>(null)
  const rafRef = useRef<number | null>(null)
  const tickRef = useRef<() => void>(() => undefined)

  const getActiveScope = useCallback(() => {
    if (!activeScopeIdRef.current) {
      return null
    }

    return scopesRef.current.get(activeScopeIdRef.current) ?? null
  }, [])

  const scheduleTick = useCallback(() => {
    if (rafRef.current !== null) {
      return
    }

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null
      tickRef.current()
    })
  }, [])

  useEffect(() => {
    tickRef.current = () => {
      const scope = getActiveScope()

      if (!scope) {
        return
      }

      const nextProgress = clamp(
        lerp(scope.currentProgress, scope.targetProgress, scope.damping),
        scope.minProgress,
        scope.maxProgress,
      )

      scope.currentProgress = nextProgress
      scope.onProgress?.(nextProgress)

      const settled = Math.abs(scope.targetProgress - scope.currentProgress) <= 0.0005

      if (!settled) {
        scheduleTick()
        return
      }

      if (scope.locked) {
        scope.locked = false
        scope.onLockChange?.(false)
      }
    }
  }, [getActiveScope, scheduleTick])

  const registerScope = useCallback((registration: ScrollScopeRegistration) => {
    const runtime: ScrollScopeRuntime = {
      id: registration.id,
      enabled: registration.enabled ?? true,
      touchEnabled: registration.touchEnabled ?? true,
      sensitivity: registration.sensitivity ?? 0.0025,
      damping: registration.damping ?? 0.12,
      minProgress: registration.clamp?.[0] ?? 0,
      maxProgress: registration.clamp?.[1] ?? 1,
      targetProgress: 0,
      currentProgress: 0,
      locked: false,
      getElement: registration.getElement,
      onProgress: registration.onProgress,
      onLockChange: registration.onLockChange,
    }

    scopesRef.current.set(runtime.id, runtime)

    return () => {
      const current = scopesRef.current.get(runtime.id)

      if (current?.locked) {
        current.onLockChange?.(false)
      }

      scopesRef.current.delete(runtime.id)

      if (activeScopeIdRef.current === runtime.id) {
        activeScopeIdRef.current = null
      }
    }
  }, [])

  const activateScope = useCallback((id: string | null) => {
    if (id !== null && !scopesRef.current.has(id)) {
      return
    }

    activeScopeIdRef.current = id
  }, [])

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const scope = getActiveScope()

      if (!scope || !scope.enabled) {
        return
      }

      if (event.deltaY === 0) {
        return
      }

      const direction = Math.sign(event.deltaY)
      const isAtStart = scope.currentProgress <= scope.minProgress + 0.0005
      const isAtEnd = scope.currentProgress >= scope.maxProgress - 0.0005

      if ((direction < 0 && isAtStart) || (direction > 0 && isAtEnd)) {
        if (scope.locked) {
          scope.locked = false
          scope.onLockChange?.(false)
        }

        return
      }

      event.preventDefault()
      scope.locked = true
      scope.onLockChange?.(true)
      scope.targetProgress = clamp(
        scope.targetProgress + event.deltaY * scope.sensitivity,
        scope.minProgress,
        scope.maxProgress,
      )
      scheduleTick()
    }

    let lastTouchY: number | null = null

    const handleTouchStart = (event: TouchEvent) => {
      const scope = getActiveScope()

      if (!scope?.touchEnabled) {
        lastTouchY = null
        return
      }

      lastTouchY = event.touches[0]?.clientY ?? null
    }

    const handleTouchMove = (event: TouchEvent) => {
      const scope = getActiveScope()

      if (!scope || !scope.touchEnabled || lastTouchY === null) {
        return
      }

      const currentY = event.touches[0]?.clientY

      if (currentY === undefined) {
        return
      }

      const deltaY = lastTouchY - currentY
      lastTouchY = currentY

      if (Math.abs(deltaY) < 1) {
        return
      }

      const direction = Math.sign(deltaY)
      const isAtStart = scope.currentProgress <= scope.minProgress + 0.0005
      const isAtEnd = scope.currentProgress >= scope.maxProgress - 0.0005

      if ((direction < 0 && isAtStart) || (direction > 0 && isAtEnd)) {
        if (scope.locked) {
          scope.locked = false
          scope.onLockChange?.(false)
        }

        return
      }

      event.preventDefault()
      scope.locked = true
      scope.onLockChange?.(true)
      scope.targetProgress = clamp(
        scope.targetProgress + deltaY * scope.sensitivity * 1.35,
        scope.minProgress,
        scope.maxProgress,
      )
      scheduleTick()
    }

    const handleTouchEnd = () => {
      lastTouchY = null
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    window.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [getActiveScope, scheduleTick])

  const value = useMemo<ScrollEngineContextValue>(
    () => ({
      registerScope,
      activateScope,
      getActiveScopeId: () => activeScopeIdRef.current,
    }),
    [activateScope, registerScope],
  )

  return <ScrollEngineContext.Provider value={value}>{children}</ScrollEngineContext.Provider>
}

export function useScrollEngine() {
  const context = useContext(ScrollEngineContext)

  if (!context) {
    throw new Error('useScrollEngine must be used inside ScrollEngineProvider')
  }

  return context
}
