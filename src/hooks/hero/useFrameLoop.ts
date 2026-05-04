import { useEffect, useRef } from 'react'

import { isBrowser } from '../../utils/isBrowser'

type FrameLoopCallback = (time: number, delta: number) => void

type UseFrameLoopOptions = {
  enabled?: boolean
  onFrame: FrameLoopCallback
}

export function useFrameLoop({ enabled = true, onFrame }: UseFrameLoopOptions) {
  const callbackRef = useRef(onFrame)

  useEffect(() => {
    callbackRef.current = onFrame
  }, [onFrame])

  useEffect(() => {
    if (!enabled || !isBrowser()) {
      return
    }

    let frameId = 0
    let lastTime = 0

    const loop = (time: number) => {
      const delta = lastTime === 0 ? 0 : time - lastTime
      lastTime = time
      callbackRef.current(time, delta)
      frameId = window.requestAnimationFrame(loop)
    }

    frameId = window.requestAnimationFrame(loop)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [enabled])
}
