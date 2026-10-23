import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import { ui, useLang } from '../i18n'
import './hero.css'

/** rows → phrases → words. A phrase never breaks across lines. */
const rows: string[][][] = [
  [['PARSE'], ['THE', 'UNKNOWN']],
  [['RENDER'], ['THE', 'FEATURE']],
]

const smooth = (x: number) => {
  const c = Math.max(0, Math.min(1, x))
  return c * c * (3 - 2 * c)
}

export function Hero() {
  const { t } = useLang()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    const chars = Array.from(el.querySelectorAll<HTMLElement>('.ch'))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // raw: 1 = unparsed wireframe, 0 = rendered. lens: cursor "inspector" strength.
    const intro = chars.map(() => ({ v: reduce ? 0 : 1 }))
    const lens = chars.map(() => 0)
    const write = (i: number) => {
      chars[i].style.setProperty('--raw', intro[i].v.toFixed(3))
      chars[i].style.setProperty('--lens', lens[i].toFixed(3))
    }
    chars.forEach((_, i) => write(i))

    let alive = true
    let ready = reduce
    let visible = true
    let raf = 0
    let px = 0
    let py = 0
    let lastMove = -1e9
    let lx = 0
    let ly = 0

    const onMove = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
      lastMove = performance.now()
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(el)

    // Letter centres relative to the hero, measured once per layout change instead of
    // calling getBoundingClientRect on every glyph every frame.
    let centres: { x: number; y: number }[] = []
    const measure = () => {
      const base = el.getBoundingClientRect()
      centres = chars.map((c) => {
        const prevTransform = c.style.transform
        c.style.transform = 'none'
        const r = c.getBoundingClientRect()
        c.style.transform = prevTransform
        return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 }
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    document.fonts.ready.then(() => alive && measure(), () => undefined)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible || reduce) return

      const rect = el.getBoundingClientRect()
      const hasPointer = now - lastMove < 2600
      let tx = px
      let ty = py
      if (!hasPointer) {
        // No pointer (touch, or idle): the lens drifts along the text by itself.
        if (!ready) {
          tx = -9999
          ty = -9999
        } else {
          tx = rect.left + rect.width * (0.5 + 0.44 * Math.sin(now / 2700))
          ty = rect.top + rect.height * (0.5 + 0.16 * Math.sin(now / 1900 + 1))
        }
      }
      lx += (tx - lx) * 0.14
      ly += (ty - ly) * 0.14

      const radius = Math.max(110, Math.min(260, rect.width * 0.15))
      for (let i = 0; i < chars.length; i += 1) {
        const c = centres[i]
        const d = Math.hypot(rect.left + c.x - lx, rect.top + c.y - ly)
        const p = smooth(1 - d / radius)
        lens[i] = Math.max(p, lens[i] * 0.93)
        write(i)
      }
    }
    raf = requestAnimationFrame(tick)

    if (!reduce) {
      const start = () => {
        if (!alive) return
        gsap.to(intro, {
          v: 0,
          duration: 0.4,
          ease: 'power1.out',
          stagger: 0.055,
          delay: 0.25,
          onUpdate: () => chars.forEach((_, i) => write(i)),
          onComplete: () => {
            ready = true
            el.classList.add('is-ready')
          },
        })
      }
      document.fonts.ready.then(start, start)
    } else {
      el.classList.add('is-ready')
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      gsap.killTweensOf(intro)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section className="hero" ref={root}>
      <h1 className="hero__title" aria-label={t(ui.hero.label)}>
        {rows.map((phrases, r) => (
          <span className="hero__row" key={r} aria-hidden="true">
            {phrases.map((words, p) => (
              <span className="hero__phrase" key={p}>
                {words.map((word, w) => (
                  <span className={`hero__word ${word === 'THE' ? 'hero__word--small' : ''}`} key={w}>
                    {Array.from(word).map((ch, c) => (
                      <span className="ch" key={c}>
                        {ch}
                      </span>
                    ))}
                    {r === 1 && p === 1 && w === 1 && <span className="hero__caret" />}
                  </span>
                ))}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <p className="hero__tagline">{t(ui.hero.tagline)}</p>
    </section>
  )
}
