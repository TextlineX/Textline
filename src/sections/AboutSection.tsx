import { useAppShellScroll } from '../components/layout/AppShellScrollContext'
import { SectionShell } from '../components/shared/SectionShell'
import { StickyMagneticTitle } from '../components/shared/StickyMagneticTitle'
import { AboutShowcaseModel } from './about/AboutShowcaseModel'

import './AboutSection.less'

export function AboutSection() {
  const { scrollOffset, viewportHeight } = useAppShellScroll()
  const sectionProgress = viewportHeight > 0 ? scrollOffset / viewportHeight - 1 : 0
  const engaged = sectionProgress >= -1.1 && sectionProgress <= 0.85

  return (
    <SectionShell id="about">
      <section className="about-showcase" aria-labelledby="about-showcase-title">
        <div className="about-showcase__layout">
          <header className="about-showcase__header">
            <StickyMagneticTitle
              as="h2"
              id="about-showcase-title"
              className="about-showcase__title-linger"
              sectionIndex={1}
              anchorVh={0.1}
              blurDelayVh={0.1}
              blurSpanVh={0.14}
              blurMaxPx={5}
              followDelayVh={0.02}
              followEase={0.88}
              targetClassName="about-showcase__title"
              stickTopVh={0.08}
              lingerVh={0.24}
              releaseVh={0.16}
              fadeVh={0.2}
            >
              <span>About</span>
            </StickyMagneticTitle>
          </header>

          <aside className="about-showcase__visual" aria-label="about three.js showcase">
            <div className="about-showcase__visual-frame">
              {engaged ? <AboutShowcaseModel /> : <div className="about-showcase-model__overlay" aria-hidden="true">
                <div className="about-showcase-model__overlay-title">SCROLL TO ACTIVATE</div>
                <div className="about-showcase-model__overlay-copy">About 3D 模型只在该窗口可见时运行。</div>
              </div>}
            </div>
          </aside>
        </div>
      </section>
    </SectionShell>
  )
}
