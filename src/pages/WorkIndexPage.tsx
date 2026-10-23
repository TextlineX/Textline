import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { categories, techIndex, works } from '../data/works'
import type { CategoryId, Work } from '../data/works'
import { WorkList } from '../components/WorkList'
import { useMeta } from '../meta'
import './work-index.css'

type View = 'list' | 'grid'

function readView(): View {
  try {
    return localStorage.getItem('tl-view') === 'grid' ? 'grid' : 'list'
  } catch {
    return 'list'
  }
}

const matches = (w: Work, cat: string | null, tech: string | null) =>
  (!cat || w.categories.includes(cat as CategoryId)) && (!tech || w.tech.includes(tech))

export function WorkIndexPage() {
  const { t } = useLang()
  const [params, setParams] = useSearchParams()
  const [view, setViewState] = useState<View>(readView)

  const cat = categories.some((c) => c.id === params.get('cat')) ? params.get('cat') : null
  const tech = techIndex.some((x) => x.tech === params.get('tech')) ? params.get('tech') : null
  const items = works.filter((w) => matches(w, cat, tech))

  useMeta(t(ui.index.title), t(ui.index.lead))

  const setFilter = (key: 'cat' | 'tech', value: string | null) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const setView = (v: View) => {
    setViewState(v)
    try {
      localStorage.setItem('tl-view', v)
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="windex" id="main" tabIndex={-1}>
      <header className="windex__head">
        <h1 className="windex__title">{t(ui.index.title)}</h1>
        <div className="windex__intro">
          <p>{t(ui.index.lead)}</p>
          <p className="windex__count" aria-live="polite">
            {t(ui.index.count)(items.length)}
          </p>
        </div>
      </header>

      <div className="windex__filters">
        <div className="windex__group" role="group" aria-label={t(ui.index.area)}>
          <span className="windex__label">{t(ui.index.area)}</span>
          <div className="windex__chips">
            <button type="button" className="chip" aria-pressed={!cat} onClick={() => setFilter('cat', null)}>
              {t(ui.index.all)}
            </button>
            {categories.map((c) => {
              const n = works.filter((w) => matches(w, c.id, tech)).length
              return (
                <button
                  type="button"
                  key={c.id}
                  className="chip"
                  aria-pressed={cat === c.id}
                  disabled={n === 0 && cat !== c.id}
                  onClick={() => setFilter('cat', cat === c.id ? null : c.id)}
                >
                  {t(c.name)}
                  <span className="chip__n">{n}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="windex__group" role="group" aria-label={t(ui.index.tech)}>
          <span className="windex__label">{t(ui.index.tech)}</span>
          <div className="windex__chips windex__chips--tech">
            <button type="button" className="chip" aria-pressed={!tech} onClick={() => setFilter('tech', null)}>
              {t(ui.index.all)}
            </button>
            {techIndex.map(({ tech: name }) => {
              const n = works.filter((w) => matches(w, cat, name)).length
              return (
                <button
                  type="button"
                  key={name}
                  className="chip"
                  aria-pressed={tech === name}
                  disabled={n === 0 && tech !== name}
                  onClick={() => setFilter('tech', tech === name ? null : name)}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="windex__group windex__group--view" role="group" aria-label={t(ui.index.view)}>
          <span className="windex__label">{t(ui.index.view)}</span>
          <div className="windex__chips">
            <button type="button" className="chip" aria-pressed={view === 'list'} onClick={() => setView('list')}>
              {t(ui.index.list)}
            </button>
            <button type="button" className="chip" aria-pressed={view === 'grid'} onClick={() => setView('grid')}>
              {t(ui.index.grid)}
            </button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="windex__empty">
          <p>{t(ui.index.empty)}</p>
          <button type="button" className="chip" onClick={() => setParams({}, { replace: true })}>
            {t(ui.index.clear)}
          </button>
        </div>
      ) : view === 'list' ? (
        <WorkList items={items} />
      ) : (
        <ul className="wgrid">
          {items.map((w) => (
            <li key={w.id}>
              <Link to={`/work/${w.id}`} className="wgrid__item">
                <span className={`wgrid__shot ${w.portrait ? 'is-portrait' : ''}`}>
                  <img src={w.image} width={w.size[0]} height={w.size[1]} alt="" loading="lazy" />
                </span>
                <span className="wgrid__name">{w.name}</span>
                <span className="wgrid__type">{t(w.type)}</span>
                <span className="wgrid__summary">{t(w.summary)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
