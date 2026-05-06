import { useEffect } from 'react'

import { SectionShell } from '../components/shared/SectionShell'
import { useAppShellScroll } from '../components/layout/AppShellScrollContext'
import { StickyMagneticTitle } from '../components/shared/StickyMagneticTitle'
import { CodeTunnel } from './works/CodeTunnel'
import { WorksModePanel } from './works/WorksModePanel'
import './WorksSection.less'

export function WorksSection() {
  const { scrollOffset, viewportHeight } = useAppShellScroll()
  const sectionProgress = viewportHeight > 0 ? scrollOffset / viewportHeight - 3 : 0
  const engaged = sectionProgress >= -0.35 && sectionProgress <= 0.85

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('works-tunnel-cursor-state', { detail: { active: engaged } }))

    return () => {
      window.dispatchEvent(new CustomEvent('works-tunnel-cursor-state', { detail: { active: false } }))
    }
  }, [engaged])

  return (
    <SectionShell id="works">
      <section className={`works-showcase${engaged ? ' works-showcase--engaged' : ''}`} aria-labelledby="works-showcase-title">
        <div className="works-showcase__frame">
          <div className="works-showcase__tunnel">
            <CodeTunnel engaged={engaged} />
          </div>

          <div className="works-showcase__mode">
            <WorksModePanel engaged={engaged} />
          </div>

          <div className="works-showcase__header-layer">
            <header className="works-showcase__header">
              <StickyMagneticTitle
                as="h2"
                id="works-showcase-title"
                className="works-showcase__title-linger"
                sectionIndex={3}
                anchorVh={0.1}
                blurDelayVh={0.1}
                blurSpanVh={0.14}
                blurMaxPx={5}
                followDelayVh={0.02}
                followEase={0.88}
                targetClassName="works-showcase__title"
                stickTopVh={0.08}
                lingerVh={0.26}
                releaseVh={0.16}
                fadeVh={0.2}
              >
                <span>Works</span>
              </StickyMagneticTitle>
              <p className="works-showcase__subtitle">Code tunnel online. Scroll through the channel.</p>
            </header>
          </div>
        </div>
      </section>
    </SectionShell>
  )
}
