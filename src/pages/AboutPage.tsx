import { useState } from 'react'
import { Link } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { categories, techIndex, works } from '../data/works'
import { Contact } from '../sections/Contact'
import { useMeta } from '../meta'
import './about-page.css'

export function AboutPage() {
  const { t } = useLang()
  const [hoverWork, setHoverWork] = useState<string | null>(null)

  useMeta(t(ui.aboutPage.title), t(ui.about.lead))

  return (
    <>
      <main className="apage" id="main" tabIndex={-1}>
        <h1 className="apage__title">{t(ui.aboutPage.title)}</h1>

        <div className="apage__intro">
          <p className="apage__lead">{t(ui.about.lead)}</p>
          <p className="apage__body">{t(ui.about.body)}</p>
        </div>

        <section className="apage__block">
          <h2 className="apage__h2">{t(ui.aboutPage.areasTitle)}</h2>
          <ul className="areas">
            {categories.map((c) => {
              const n = works.filter((w) => w.categories.includes(c.id)).length
              return (
                <li key={c.id}>
                  <Link to={`/work?cat=${c.id}`} className="areas__item">
                    <span className="areas__name">{t(c.name)}</span>
                    <span className="areas__note">{t(c.note)}</span>
                    <span className="areas__n">{t(ui.aboutPage.projects)(n)}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="apage__block">
          <div className="apage__blockhead">
            <h2 className="apage__h2">{t(ui.aboutPage.matrixTitle)}</h2>
            <p>{t(ui.aboutPage.matrixLead)}</p>
          </div>

          <div className="matrix-wrap">
            <table className="matrix" onPointerLeave={() => setHoverWork(null)}>
              <thead>
                <tr>
                  <th scope="col" className="matrix__corner">
                    <span className="sr-only">{t(ui.index.tech)}</span>
                  </th>
                  {works.map((w) => (
                    <th
                      scope="col"
                      key={w.id}
                      className={`matrix__work ${hoverWork === w.id ? 'is-hot' : ''}`}
                      onPointerEnter={() => setHoverWork(w.id)}
                    >
                      <Link to={`/work/${w.id}`}>{w.name}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {techIndex.map(({ tech, works: used }) => (
                  <tr key={tech}>
                    <th scope="row" className="matrix__tech">
                      <Link to={`/work?tech=${encodeURIComponent(tech)}`}>{tech}</Link>
                    </th>
                    {works.map((w) => {
                      const on = used.includes(w)
                      return (
                        <td
                          key={w.id}
                          className={`${hoverWork === w.id ? 'is-hot' : ''}`}
                          onPointerEnter={() => setHoverWork(w.id)}
                        >
                          {on ? (
                            <>
                              <span className="matrix__dot" aria-hidden="true" />
                              <span className="sr-only">✓</span>
                            </>
                          ) : (
                            <span className="sr-only">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Contact />
    </>
  )
}
