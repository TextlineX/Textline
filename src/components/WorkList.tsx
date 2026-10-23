import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

import { useLang } from '../i18n'
import type { Work } from '../data/works'
import '../sections/works.css'

/** Big index rows. Mouse users get a preview that follows the cursor; touch gets inline thumbnails. */
export function WorkList({ items }: { items: Work[] }) {
  const { t } = useLang()
  const list = useRef<HTMLUListElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const box = preview.current
    const ul = list.current
    if (!box || !ul) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const moveX = gsap.quickTo(box, 'x', { duration: 0.45, ease: 'power3.out' })
    const moveY = gsap.quickTo(box, 'y', { duration: 0.45, ease: 'power3.out' })
    const onMove = (e: PointerEvent) => {
      const w = box.offsetWidth
      const h = box.offsetHeight
      moveX(Math.min(e.clientX + 32, window.innerWidth - w - 16))
      moveY(Math.max(16, Math.min(e.clientY - h / 2, window.innerHeight - h - 16)))
    }
    ul.addEventListener('pointermove', onMove)
    return () => ul.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <ul className="works__list" ref={list} onPointerLeave={() => setActive(null)}>
        {items.map((work) => (
          <li key={work.id}>
            <Link
              to={`/work/${work.id}`}
              className="row"
              onPointerEnter={() => setActive(work.id)}
              onFocus={() => setActive(work.id)}
              onBlur={() => setActive(null)}
            >
              <span className="row__name">{work.name}</span>
              <span className="row__meta">
                <span className="row__type">{t(work.type)}</span>
                <span className="row__tech">{work.tech.join(' / ')}</span>
              </span>
              <span className={`row__thumb ${work.portrait ? 'is-portrait' : ''}`}>
                <img src={work.image} width={work.size[0]} height={work.size[1]} alt="" loading="lazy" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={`works__preview ${active ? 'is-on' : ''}`} ref={preview} aria-hidden="true">
        {items.map((work) => (
          <img
            key={work.id}
            src={work.image}
            alt=""
            className={`${work.id === active ? 'is-active' : ''} ${work.portrait ? 'is-portrait' : ''}`}
          />
        ))}
      </div>
    </>
  )
}
