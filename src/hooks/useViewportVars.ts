import { useEffect } from 'react'

type UseViewportVarsOptions = {
  width: number
  height: number
}

export function useViewportVars({ width, height }: UseViewportVarsOptions) {

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--viewport-width', `${width}px`)
    root.style.setProperty('--viewport-height', `${height}px`)
  }, [height, width])
}
