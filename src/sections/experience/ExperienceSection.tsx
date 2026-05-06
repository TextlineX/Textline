import { SectionShell } from '../../components/shared/SectionShell'
import { StickyMagneticTitle } from '../../components/shared/StickyMagneticTitle'
import { ExperienceTimeline } from './ExperienceTimeline'
import './ExperienceSection.less'

export function ExperienceSection() {
  return (
    <SectionShell id="experience">
      <section className="experience-showcase" aria-labelledby="experience-showcase-title">
        <div className="experience-showcase__frame">
          <div className="experience-showcase__timeline">
            <ExperienceTimeline sectionIndex={4} />
          </div>

          <div className="experience-showcase__header">
            <StickyMagneticTitle
              as="h2"
              id="experience-showcase-title"
              className="experience-showcase__title-linger"
              sectionIndex={4}
              anchorVh={0.12}
              blurDelayVh={0.1}
              blurSpanVh={0.14}
              blurMaxPx={5}
              followDelayVh={0.02}
              followEase={0.88}
              targetClassName="experience-showcase__title"
              stickTopVh={0.08}
              lingerVh={0.24}
              releaseVh={0.16}
              fadeVh={0.2}
            >
              <span>Experience</span>
            </StickyMagneticTitle>

            <p className="experience-showcase__subtitle">A warped path that shifts while the section progresses.</p>
          </div>
        </div>
      </section>
    </SectionShell>
  )
}
