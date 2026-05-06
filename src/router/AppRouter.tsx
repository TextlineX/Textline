import { useEffect, useState } from 'react'

import { GamePage } from '../pages/game'
import { HomePage } from '../pages/home'

function getPathname() {
  return window.location.pathname.replace(/\/+$/, '') || '/'
}

export function AppRouter() {
  const [pathname, setPathname] = useState(getPathname)

  useEffect(() => {
    const handlePopState = () => {
      setPathname(getPathname())
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  if (pathname === '/game' || pathname.startsWith('/game/')) {
    return <GamePage />
  }

  return <HomePage />
}
