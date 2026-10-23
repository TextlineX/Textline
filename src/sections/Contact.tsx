import { useEffect, useRef, useState } from 'react'

import { EMAIL, GITHUB, ui, useLang } from '../i18n'
import './contact.css'

export function Contact() {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="contact__top">
        <h2 className="contact__title">{t(ui.contact.title)}</h2>
        <p className="contact__intro">{t(ui.contact.intro)}</p>
      </div>

      <a className="contact__mail" href={`mailto:${EMAIL}`}>
        {EMAIL}
      </a>

      <div className="contact__actions">
        <button type="button" className="contact__btn" onClick={copy}>
          {copied ? t(ui.contact.copied) : t(ui.contact.copy)}
        </button>
        <a className="contact__btn" href={GITHUB} target="_blank" rel="noopener noreferrer">
          {t(ui.contact.github)}
        </a>
        <span className="sr-only" role="status">
          {copied ? t(ui.contact.copied) : ''}
        </span>
      </div>

      <footer className="contact__foot">
        <span>© {new Date().getFullYear()} Textline</span>
        <span className="contact__sign" aria-hidden="true">
          Textline
        </span>
      </footer>
    </section>
  )
}
