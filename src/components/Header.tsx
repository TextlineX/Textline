import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { ui, useLang } from '../i18n'
import { works } from '../data/works'
import { openPalette, toggleTheme, useTheme } from '../theme'
import './header.css'

export function Header() {
  const { lang, setLang, t } = useLang()
  const { pathname } = useLocation()
  const theme = useTheme()
  const [pastHero, setPastHero] = useState(false)
  const onHome = pathname === '/'
  const known =
    onHome ||
    pathname === '/work' ||
    pathname === '/about' ||
    works.some((w) => pathname === `/work/${w.id}`)

  useEffect(() => {
    if (!onHome) return
    const update = () => setPastHero(window.scrollY > window.innerHeight - 72)
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [onHome])

  // Pages that open on a blue panel (home hero, 404) start with a transparent header.
  const solid = onHome ? pastHero : known

  return (
    <header className={`header ${solid ? 'header--solid' : ''}`}>
      <a href="#main" className="skip-link">
        {t(ui.skip)}
      </a>

      <Link to="/" className="header__brand" aria-label="Textline">
        <span className="header__logo" aria-hidden="true" />
        <span className="header__word">Textline</span>
      </Link>

      <nav className="header__nav" aria-label="Main">
        <NavLink to="/work">{t(ui.nav.work)}</NavLink>
        <NavLink to="/about" end>
          {t(ui.nav.about)}
        </NavLink>
        <Link
          className="header__contact"
          to={{ pathname: pathname === '/about' ? '/about' : '/', hash: '#contact' }}
        >
          {t(ui.nav.contact)}
        </Link>

        <button
          type="button"
          className="header__tool header__search"
          onClick={openPalette}
          aria-label={t(ui.palette.open)}
          title={`${t(ui.palette.open)} (/)`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-4.8-4.8" />
          </svg>
          <kbd className="header__kbd" aria-hidden="true">
            /
          </kbd>
        </button>
        <button
          type="button"
          className="header__tool header__lang"
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          aria-label={t(ui.switchLang)}
        >
          {t(ui.switchLangShort)}
        </button>
        <button
          type="button"
          className="header__tool"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t(ui.themeToLight) : t(ui.themeToDark)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            {theme === 'dark' ? (
              <>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </>
            ) : (
              <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z" />
            )}
          </svg>
        </button>
      </nav>
    </header>
  )
}
