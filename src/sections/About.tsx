import { Link } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import './about.css'

export function About() {
  const { t } = useLang()

  return (
    <section className="about" id="about">
      <p className="about__lead">{t(ui.about.lead)}</p>

      <div className="about__cols">
        <p className="about__body">{t(ui.about.body)}</p>

        <dl className="about__stack">
          {ui.about.stack.map((group) => (
            <div className="about__group" key={group.name.en}>
              <dt>{t(group.name)}</dt>
              <dd>{group.items.join(' / ')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Link to="/about" className="more-link">
        <span>{t(ui.home.moreAbout)}</span>
      </Link>
    </section>
  )
}
