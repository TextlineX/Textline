import { useEffect } from 'react'

import { isBrowser } from '../utils/isBrowser'
import { useViewportSize } from './useViewportSize'

export function useViewportVars() {
  const { width, height } = useViewportSize()

  useEffect(() => {
    if (!isBrowser()) {
      return
    }

    const root = document.documentElement
    root.style.setProperty('--viewport-width', `${width}px`)
    root.style.setProperty('--viewport-height', `${height}px`)
  }, [height, width])
}
