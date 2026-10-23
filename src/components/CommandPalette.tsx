import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EMAIL, GITHUB, ui, useLang } from '../i18n'
import { categories, techIndex, works } from '../data/works'
import { toggleTheme, useTheme } from '../theme'
import './command-palette.css'

type Item = {
  id: string
  group: 'pages' | 'work' | 'areas' | 'tech' | 'actions'
  label: string
  hint?: string
  /** Extra words that should match, in both languages. */
  keywords: string
  run: () => void | 'keep-open'
}

const GROUP_ORDER: Item['group'][] = ['pages', 'work', 'areas', 'tech', 'actions']

export function CommandPalette() {
  const { lang, setLang, t } = useLang()
  const theme = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  // Shortcuts: "/" or Cmd/Ctrl+K to open, from anywhere outside a text field.
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement | null
      setQuery('')
      setActive(0)
      setCopied(false)
      setOpen(true)
    }
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        show()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('tl:palette', show)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('tl:palette', show)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    input.current?.focus()
    return () => {
      document.body.style.overflow = prev
      returnFocus.current?.focus?.()
    }
  }, [open])

  const close = () => setOpen(false)

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => {
      void navigate(to)
    }
    const both = (v: { zh: string; en: string }) => `${v.zh} ${v.en}`
    return [
      { id: 'p-home', group: 'pages', label: t(ui.palette.home), keywords: 'home 首页 textline', run: go('/') },
      { id: 'p-work', group: 'pages', label: t(ui.index.title), keywords: both(ui.index.title) + ' projects', run: go('/work') },
      { id: 'p-about', group: 'pages', label: t(ui.aboutPage.title), keywords: both(ui.aboutPage.title), run: go('/about') },
      { id: 'p-contact', group: 'pages', label: t(ui.nav.contact), keywords: both(ui.nav.contact) + ' email 邮件', run: go('/#contact') },
      ...works.map<Item>((w) => ({
        id: `w-${w.id}`,
        group: 'work',
        label: w.name,
        hint: t(w.type),
        keywords: `${both(w.type)} ${w.tech.join(' ')}`,
        run: go(`/work/${w.id}`),
      })),
      ...categories.map<Item>((c) => ({
        id: `c-${c.id}`,
        group: 'areas',
        label: t(c.name),
        hint: t(c.note),
        keywords: both(c.name),
        run: go(`/work?cat=${c.id}`),
      })),
      ...techIndex.map<Item>(({ tech, works: used }) => ({
        id: `t-${tech}`,
        group: 'tech',
        label: tech,
        hint: used.map((w) => w.name).join(', '),
        keywords: '',
        run: go(`/work?tech=${encodeURIComponent(tech)}`),
      })),
      {
        id: 'a-theme',
        group: 'actions',
        label: theme === 'dark' ? t(ui.themeToLight) : t(ui.themeToDark),
        keywords: 'theme dark light 主题 深色 浅色',
        run: () => {
          toggleTheme()
          return 'keep-open'
        },
      },
      {
        id: 'a-lang',
        group: 'actions',
        label: t(ui.switchLang),
        keywords: 'language 语言 english 中文',
        run: () => {
          setLang(lang === 'zh' ? 'en' : 'zh')
          return 'keep-open'
        },
      },
      {
        id: 'a-copy',
        group: 'actions',
        label: copied ? t(ui.contact.copied) : t(ui.contact.copy),
        hint: EMAIL,
        keywords: 'email copy 邮箱 复制',
        run: () => {
          navigator.clipboard?.writeText(EMAIL).then(() => setCopied(true), () => undefined)
          return 'keep-open'
        },
      },
      {
        id: 'a-github',
        group: 'actions',
        label: t(ui.palette.github),
        hint: 'github.com/TextlineX',
        keywords: 'github code 代码',
        run: () => {
          window.open(GITHUB, '_blank', 'noopener')
        },
      },
    ]
  }, [t, lang, setLang, theme, copied, navigate])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)
    const hit = (it: Item) => {
      const hay = `${it.label} ${it.hint ?? ''} ${it.keywords}`.toLowerCase()
      return tokens.every((tok) => hay.includes(tok))
    }
    // With no query, technologies are left out to keep the list short.
    const pool = tokens.length ? items.filter(hit) : items.filter((it) => it.group !== 'tech')
    const grouped = GROUP_ORDER.flatMap((g) => pool.filter((it) => it.group === g))
    // An exact name match ("react", "ttab") jumps to the top so Enter does the obvious thing.
    const exact = grouped.filter((it) => it.label.toLowerCase() === q)
    return exact.length ? [...exact, ...grouped.filter((it) => !exact.includes(it))] : grouped
  }, [items, query])

  const current = Math.min(active, Math.max(results.length - 1, 0))

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [current])

  const runItem = (it: Item | undefined) => {
    if (!it) return
    if (it.run() !== 'keep-open') close()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((current + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((current - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runItem(results[current])
    } else if (e.key === 'Tab') {
      e.preventDefault() // keep focus inside the dialog
    }
  }

  if (!open) return null

  return (
    <div className="palette" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette__panel" role="dialog" aria-modal="true" aria-label={t(ui.palette.label)} onKeyDown={onKeyDown}>
        <div className="palette__line">
          <span className="palette__prompt" aria-hidden="true">
            ›
          </span>
          <input
            ref={input}
            className="palette__input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder={t(ui.palette.placeholder)}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[current] ? `pi-${results[current].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="palette__list" id="palette-list" role="listbox" ref={listRef} aria-label={t(ui.palette.label)}>
          {results.length === 0 && <p className="palette__empty">{t(ui.palette.empty)(query.trim())}</p>}
          {results.map((it, i) => {
            const heading = it.group !== results[i - 1]?.group ? t(ui.palette[it.group]) : null
            return (
              <div key={it.id} role="presentation">
                {heading && (
                  <div className="palette__group" role="presentation">
                    {heading}
                  </div>
                )}
                <div
                  id={`pi-${it.id}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === current}
                  className="palette__item"
                  onMouseMove={() => i !== current && setActive(i)}
                  onClick={() => runItem(it)}
                >
                  <span className="palette__label">{it.label}</span>
                  {it.hint && <span className="palette__hint">{it.hint}</span>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="palette__foot" aria-hidden="true">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {t(ui.palette.hintMove)}
          </span>
          <span>
            <kbd>↵</kbd> {t(ui.palette.hintOpen)}
          </span>
          <span>
            <kbd>esc</kbd> {t(ui.palette.hintClose)}
          </span>
        </div>
      </div>
    </div>
  )
}
