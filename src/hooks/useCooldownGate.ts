import { useCallback, useEffect, useRef, useState } from 'react'

type UseCooldownGateOptions = {
  delayMs: number
  initialReady?: boolean
}

type CooldownGateState = {
  ready: boolean
  pulseId: number
  arm: () => boolean
  touch: () => void
  reset: () => void
}

export function useCooldownGate({ delayMs, initialReady = true }: UseCooldownGateOptions): CooldownGateState {
  const [ready, setReady] = useState(initialReady)
  const [pulseId, setPulseId] = useState(0)
  const readyRef = useRef(initialReady)
  const timerRef = useRef<number | undefined>(undefined)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    readyRef.current = true
    setReady(true)
  }, [clearTimer])

  const arm = useCallback(() => {
    const shouldEmit = readyRef.current
    readyRef.current = false
    setReady(false)
    clearTimer()

    if (shouldEmit) {
      setPulseId((current) => current + 1)
    }

    timerRef.current = window.setTimeout(() => {
      readyRef.current = true
      setReady(true)
      timerRef.current = undefined
    }, delayMs)

    return shouldEmit
  }, [clearTimer, delayMs])

  const touch = useCallback(() => {
    readyRef.current = false
    setReady(false)
    clearTimer()

    timerRef.current = window.setTimeout(() => {
      readyRef.current = true
      setReady(true)
      timerRef.current = undefined
    }, delayMs)
  }, [clearTimer, delayMs])

  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  return {
    ready,
    pulseId,
    arm,
    touch,
    reset,
  }
}
