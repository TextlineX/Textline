import { useEffect, useState } from 'react'

import { isBrowser } from '../utils/isBrowser'

export type ViewportSize = {
  width: number
  height: number
}

function readViewportSize(): ViewportSize {
  if (!isBrowser()) {
    return { width: 0, height: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useViewportSize() {
  const [viewport, setViewport] = useState(readViewportSize)

  useEffect(() => {
    if (!isBrowser()) {
      return
    }

    const handleResize = () => {
      setViewport(readViewportSize())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return viewport
}
