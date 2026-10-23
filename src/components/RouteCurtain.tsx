import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

import { ui, useLang } from '../i18n'
import { works } from '../data/works'
import './route-curtain.css'

/**
 * Page transition: a blue panel carrying the destination's name sits over the new
 * page for a beat, then lifts away. Skipped on first load, on hash-only changes
 * and when reduced motion is requested.
 */
export function RouteCurtain() {
  const { pathname } = useLocation()
  const { t } = useLang()
  const panel = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  const [label, setLabel] = useState('')

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const el = panel.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const workId = pathname.match(/^\/work\/([^/]+)$/)?.[1]
    const name =
      pathname === '/'
        ? 'Textline'
        : pathname === '/work'
          ? t(ui.index.title)
          : pathname === '/about'
            ? t(ui.aboutPage.title)
            : (works.find((w) => w.id === workId)?.name ?? '404')
    setLabel(name)

    const tl = gsap.timeline()
    tl.set(el, { visibility: 'visible', clipPath: 'inset(0% 0% 0% 0%)' })
      .fromTo(el.firstElementChild, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
      .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.55, ease: 'power3.inOut' }, '+=0.12')
      .set(el, { visibility: 'hidden' })
    return () => {
      tl.kill()
      gsap.set(el, { visibility: 'hidden' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <div className="curtain" ref={panel} aria-hidden="true">
      <span className="curtain__label">{label}</span>
    </div>
  )
}
