import { Children, type PropsWithChildren, useEffect, useMemo, useState } from 'react'

import { CornerIcon } from '../../effects/CornerIcon'
import { LogoMark } from '../shared/LogoMark'
import { SideDrawer } from '../shared/SideDrawer'
import { navItems } from '../../data/siteData'
import { useViewportSize } from '../../hooks/useViewportSize'
import { useViewportVars } from '../../hooks/useViewportVars'
import { useWheelNavigation } from '../../hooks/useWheelNavigation'
import './AppShell.less'

type AppShellProps = PropsWithChildren

export function AppShell({ children }: AppShellProps) {
  const viewport = useViewportSize()
  useViewportVars()
  const sections = useMemo(() => Children.toArray(children), [children])
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const nextIndex = Math.max(0, Math.min(navItems.length - 1, activeIndex))
    document.documentElement.style.setProperty('--active-section-index', String(nextIndex))
  }, [activeIndex])

  useEffect(() => {
    document.documentElement.dataset.menuOpen = menuOpen ? 'true' : 'false'
    return () => {
      delete document.documentElement.dataset.menuOpen
    }
  }, [menuOpen])

  useWheelNavigation({
    enabled: sections.length > 1 && !menuOpen,
    delayMs: 180,
    onStep: (direction) => {
      setActiveIndex((current) => {
        const next = direction === 'down' ? current + 1 : current - 1
        return Math.max(0, Math.min(sections.length - 1, next))
      })
    },
  })

  return (
    <div className="app-shell">
      <LogoMark
        onClick={() => {
          setActiveIndex(0)
          setMenuOpen(false)
        }}
      />
      <CornerIcon open={menuOpen} onToggle={() => setMenuOpen((current) => !current)} />
      <SideDrawer
        open={menuOpen}
        activeIndex={activeIndex}
        onClose={() => setMenuOpen(false)}
        onNavigate={(index) => {
          setActiveIndex(index)
        }}
      />
      <main className="app-shell__main">
        <div
          className="app-shell__viewport"
          style={{ transform: `translate3d(0, -${activeIndex * viewport.height}px, 0)` }}
        >
          {sections.map((section, index) => (
            <div className="app-shell__section" key={index}>
              {section}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
