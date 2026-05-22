import { useCallback, useEffect, useRef, useState } from 'react'

import { useScrollEngine, type ScrollScopeRegistration } from './ScrollEngineProvider'

export type UseScrollScopeOptions = Omit<ScrollScopeRegistration, 'getElement'> & {
  activationRatio?: number
  rootMargin?: string
}

export function useScrollScope(options: UseScrollScopeOptions) {
  const engine = useScrollEngine()
  const scopeRef = useRef<HTMLElement | null>(null)
  const progressCallbackRef = useRef(options.onProgress)
  const lockCallbackRef = useRef(options.onLockChange)
  const [progress, setProgress] = useState(0)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    progressCallbackRef.current = options.onProgress
  }, [options.onProgress])

  useEffect(() => {
    lockCallbackRef.current = options.onLockChange
  }, [options.onLockChange])

  const bindRef = useCallback((node: HTMLElement | null) => {
    scopeRef.current = node
  }, [])

  useEffect(() => {
    return engine.registerScope({
      id: options.id,
      enabled: options.enabled,
      touchEnabled: options.touchEnabled,
      sensitivity: options.sensitivity,
      damping: options.damping,
      clamp: options.clamp,
      getElement: () => scopeRef.current,
      onProgress: (value) => {
        setProgress(value)
        progressCallbackRef.current?.(value)
      },
      onLockChange: (value) => {
        setLocked(value)
        lockCallbackRef.current?.(value)
      },
    })
  }, [
    engine,
    options.id,
    options.enabled,
    options.touchEnabled,
    options.sensitivity,
    options.damping,
    options.clamp,
  ])

  useEffect(() => {
    const element = scopeRef.current

    if (!element || !options.enabled) {
      return
    }

    const activationRatio = options.activationRatio ?? 0.35
    const rootMargin = options.rootMargin ?? '0px'

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]

        if (!entry) {
          return
        }

        if (entry.isIntersecting && entry.intersectionRatio >= activationRatio) {
          engine.activateScope(options.id)
          return
        }

        if (engine.getActiveScopeId() === options.id && entry.intersectionRatio < activationRatio) {
          engine.activateScope(null)
        }
      },
      {
        threshold: [0, activationRatio, 0.75, 1],
        rootMargin,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [engine, options.activationRatio, options.enabled, options.id, options.rootMargin])

  return {
    ref: bindRef,
    progress,
    locked,
    isActive: engine.getActiveScopeId() === options.id,
  }
}
