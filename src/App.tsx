import { Suspense, lazy, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import { LangProvider } from './i18n'
import { Header } from './components/Header'
import { RouteCurtain } from './components/RouteCurtain'
import { CommandPalette } from './components/CommandPalette'
import { HomePage } from './pages/HomePage'

// Secondary pages load on demand so the home page stays light.
const WorkIndexPage = lazy(() => import('./pages/WorkIndexPage').then((m) => ({ default: m.WorkIndexPage })))
const WorkPage = lazy(() => import('./pages/WorkPage').then((m) => ({ default: m.WorkPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

/** Scroll to the hash target if there is one, otherwise to the top on page change. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)

  useEffect(() => {
    const isFirst = first.current
    first.current = false
    if (hash) {
      let tries = 0
      let frame = 0
      // The target may live in a lazily loaded page, so retry for a few frames.
      const find = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) el.scrollIntoView()
        else if (tries++ < 30) frame = requestAnimationFrame(find)
      }
      frame = requestAnimationFrame(find)
      return () => cancelAnimationFrame(frame)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (isFirst) return
    // Move focus to the new page so screen readers announce it, like a real page load.
    let tries = 0
    let frame = 0
    const focusMain = () => {
      const main = document.getElementById('main')
      if (main) main.focus({ preventScroll: true })
      else if (tries++ < 30) frame = requestAnimationFrame(focusMain)
    }
    frame = requestAnimationFrame(focusMain)
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  return null
}

export function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollManager />
        <Header />
        <Suspense fallback={<div style={{ minHeight: '100svh' }} />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/work" element={<WorkIndexPage />} />
            <Route path="/work/:id" element={<WorkPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <RouteCurtain />
        <CommandPalette />
      </BrowserRouter>
    </LangProvider>
  )
}
