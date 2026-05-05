import { SectionShell } from '../components/shared/SectionShell'
import { StickyMagneticTitle } from '../components/shared/StickyMagneticTitle'
import { AboutShowcaseModel } from '../effects/showcase/AboutShowcaseModel'

import './AboutSection.less'

export function AboutSection() {
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
              <AboutShowcaseModel />
            </div>
          </aside>
        </div>
      </section>
    </SectionShell>
  )
}
