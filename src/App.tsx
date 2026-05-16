import { useEffect, useState } from 'react'

import { ScrollEngineProvider } from './hooks/scroll'
import { AppRouter } from './router'
import { LoadingScreen } from './components/shared'
import './App.less'

export function App() {
  const [isLoading, setIsLoading] = useState(true)

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
    <ScrollEngineProvider>
      <AppRouter isBootComplete={!isLoading} />
      <LoadingScreen visible={isLoading} />
    </ScrollEngineProvider>
  )
}
