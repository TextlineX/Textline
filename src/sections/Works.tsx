import { Link } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { works } from '../data/works'
import { WorkList } from '../components/WorkList'
import './works.css'

export function Works() {
  const { t } = useLang()

  return (
    <section className="works" id="work">
      <div className="works__head">
        <h2 className="works__title">{t(ui.work.title)}</h2>
        <p className="works__intro">{t(ui.work.intro)}</p>
      </div>

      <WorkList items={works} />

      <Link to="/work" className="more-link">
        <span>{t(ui.home.allWork)}</span>
        <span className="more-link__count">{t(ui.index.count)(works.length)}</span>
      </Link>
    </section>
  )
}
