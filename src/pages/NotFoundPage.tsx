import { Link } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { useMeta } from '../meta'
import './not-found.css'

export function NotFoundPage() {
  const { t } = useLang()

  useMeta('404', t(ui.notFound.body))

  return (
    <main className="nf" id="main" tabIndex={-1}>
      <h1 className="nf__title">
        <span className="nf__line">Parse</span>
        <span className="nf__line nf__line--raw">
          Error 404<span className="nf__caret" aria-hidden="true" />
        </span>
      </h1>
      <div className="nf__foot">
        <p>{t(ui.notFound.body)}</p>
        <div className="nf__actions">
          <Link to="/" className="nf__btn">
            {t(ui.notFound.home)}
          </Link>
          <Link to="/work" className="nf__btn">
            {t(ui.notFound.work)}
          </Link>
        </div>
      </div>
    </main>
  )
}
