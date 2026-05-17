import { useEffect, useState } from 'react'

import { AppRouter } from './router'
import { LoadingScreen } from './components/shared'
import { useDampingScroll } from './hooks/useDampingScroll'
import './App.less'

export function App() {
  const [isLoading, setIsLoading] = useState(true)

  useDampingScroll(0.08)

  useEffect(() => {
    let alive = true
    let timeoutId: number | null = null

    const finishBoot = () => {
      timeoutId = window.setTimeout(() => {
        if (alive) {
          setIsLoading(false)
        }
      }, 420)
    }

    if (document.readyState === 'complete') {
      finishBoot()
    } else {
      window.addEventListener('load', finishBoot, { once: true })
    }

    return () => {
      alive = false

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }

      window.removeEventListener('load', finishBoot)
    }
  }, [])

  return (
    <>
      <AppRouter isBootComplete={!isLoading} />
      <LoadingScreen visible={isLoading} />
    </>
  )
}
