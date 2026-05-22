import { useLayoutEffect, type RefObject } from 'react'

type UseHeroBackgroundMotionOptions = {
  stageRef: RefObject<HTMLDivElement | null>
}

export function useHeroBackgroundMotion({ stageRef }: UseHeroBackgroundMotionOptions) {
  useLayoutEffect(() => {
    const stage = stageRef.current

    if (!stage) {
      return
    }

    let timeoutId: number | null = null
    let lastAppliedAt = 0
    let pendingRatio = 0.5
    let rafId: number | null = null
    let startTime = window.performance.now()

    const applyBackgroundMotion = (xRatio: number) => {
      const pushDistance = (xRatio - 0.5) * 12
      const overlayOpacity = 0.34 + xRatio * 0.08

      stage.style.setProperty('--hero-flow-shift-x', `${pushDistance.toFixed(2)}px`)
      stage.style.setProperty('--hero-flow-x', `${(xRatio * 100).toFixed(2)}%`)
      stage.style.setProperty('--hero-flow-overlay-opacity', overlayOpacity.toFixed(3))
    }

    const tick = (now: number) => {
      const elapsed = now - startTime
      const driftX = Math.sin(elapsed * 0.00025) * 14
      const driftY = Math.cos(elapsed * 0.00018) * 8
      const overlayPulse = 0.04 * (Math.sin(elapsed * 0.00032) + 1) * 0.5

      stage.style.setProperty('--hero-flow-drift-x', `${driftX.toFixed(2)}px`)
      stage.style.setProperty('--hero-flow-drift-y', `${driftY.toFixed(2)}px`)
      stage.style.setProperty('--hero-flow-overlay-pulse', overlayPulse.toFixed(3))

      rafId = window.requestAnimationFrame(tick)
    }

    const scheduleBackgroundMotion = (clientX: number) => {
      const rect = stage.getBoundingClientRect()

      if (rect.width === 0 || rect.height === 0) {
        return
      }

      const xRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      pendingRatio = xRatio

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      const now = window.performance.now()
      const elapsed = now - lastAppliedAt
      const delay = elapsed >= 320 ? 160 : 320 - elapsed

      timeoutId = window.setTimeout(() => {
        timeoutId = null
        lastAppliedAt = window.performance.now()
        applyBackgroundMotion(pendingRatio)
      }, delay)
    }

    const resetBackgroundMotion = () => {
      const rect = stage.getBoundingClientRect()
      const centerX = rect.left + rect.width * 0.5

      scheduleBackgroundMotion(centerX)
    }

    const handlePointerEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return
      }

      scheduleBackgroundMotion(event.clientX)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return
      }

      scheduleBackgroundMotion(event.clientX)
    }

    const handlePointerLeave = () => {
      resetBackgroundMotion()
    }

    resetBackgroundMotion()
    rafId = window.requestAnimationFrame(tick)

    stage.addEventListener('pointerenter', handlePointerEnter)
    stage.addEventListener('pointermove', handlePointerMove)
    stage.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }

      stage.removeEventListener('pointerenter', handlePointerEnter)
      stage.removeEventListener('pointermove', handlePointerMove)
      stage.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [stageRef])
}
