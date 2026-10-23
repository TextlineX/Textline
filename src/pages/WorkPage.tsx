import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { categories, works } from '../data/works'
import { NotFoundPage } from './NotFoundPage'
import { useMeta } from '../meta'
import './work-page.css'

export function WorkPage() {
  const { id } = useParams()
  const { t } = useLang()
  const index = works.findIndex((w) => w.id === id)
  const work = works[index]

  const navigate = useNavigate()
  const next = works[(index + 1) % works.length]
  const prev = works[(index - 1 + works.length) % works.length]

  useMeta(work?.name ?? '404', work ? t(work.summary) : t(ui.notFound.body))

  // ← / → step through projects, unless the visitor is typing somewhere.
  useEffect(() => {
    if (!work) return
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (e.metaKey || e.ctrlKey || e.altKey || el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.key === 'ArrowRight') navigate(`/work/${next.id}`)
      if (e.key === 'ArrowLeft') navigate(`/work/${prev.id}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [work, next, prev, navigate])

  if (!work) return <NotFoundPage />

  return (
    <main className="work" id="main" tabIndex={-1}>
      <Link to="/work" className="work__back">
        {t(ui.workPage.back)}
      </Link>

      <h1 className="work__name">{work.name}</h1>

      <div className="work__intro">
        <p className="work__type">{t(work.type)}</p>
        <p className="work__summary">{t(work.summary)}</p>
      </div>

      <figure className={`work__shot ${work.portrait ? 'is-portrait' : ''}`}>
        <img src={work.image} width={work.size[0]} height={work.size[1]} alt={`${work.name}`} />
      </figure>

      <div className="work__facts">
        <section>
          <h2>{t(ui.workPage.area)}</h2>
          <ul>
            {categories
              .filter((c) => work.categories.includes(c.id))
              .map((c) => (
                <li key={c.id}>
                  <Link to={`/work?cat=${c.id}`}>{t(c.name)}</Link>
                </li>
              ))}
          </ul>
        </section>
        <section>
          <h2>{t(ui.workPage.highlights)}</h2>
          <ul>
            {t(work.highlights).map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>{t(ui.workPage.stack)}</h2>
          <ul>
            {work.tech.map((tech) => (
              <li key={tech}>
                <Link to={`/work?tech=${encodeURIComponent(tech)}`}>{tech}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <nav className="work__pager" aria-label={t(ui.workPage.pager)}>
        <Link to={`/work/${prev.id}`} className="work__prev">
          <span className="work__next-label">
            <kbd aria-hidden="true">←</kbd> {t(ui.workPage.prev)}
          </span>
          <span className="work__prev-name">{prev.name}</span>
        </Link>
        <span className="work__position">
          {index + 1} / {works.length}
        </span>
      </nav>

      <Link to={`/work/${next.id}`} className="work__next">
        <span className="work__next-label">
          {t(ui.workPage.next)} <kbd aria-hidden="true">→</kbd>
        </span>
        <span className="work__next-name">{next.name}</span>
      </Link>
    </main>
  )
}
