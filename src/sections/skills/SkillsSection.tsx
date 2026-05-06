import { SectionShell } from '../../components/shared/SectionShell'
import { ScrollLinger } from '../../effects/text/ScrollLinger'
import { skillsCloudItems } from '../../data/skillsCloudData'
import { PhysicsSkillCloud } from '../../effects/skills/PhysicsSkillCloud'
import './SkillsSection.less'

export function SkillsSection() {
  return (
    <SectionShell id="skills">
      <section className="skills-showcase" aria-labelledby="skills-showcase-title">
        <div className="skills-showcase__frame">
          <div className="skills-showcase__cloud">
            <PhysicsSkillCloud items={skillsCloudItems} limit={18} sectionIndex={2} />
          </div>

          <ScrollLinger
            className="skills-showcase__header-linger"
            sectionIndex={2}
            anchorVh={0.4}
            stickTopVh={0.08}
            lingerVh={0.2}
            releaseVh={0.15}
            fadeVh={0.18}
            blurDelayVh={0.1}
            blurSpanVh={0.16}
            blurMaxPx={5}
            followDelayVh={0.02}
            followEase={0.88}
          >
            <header className="skills-showcase__header">
              <h2 id="skills-showcase-title" className="skills-showcase__title magnetic-target" data-magnetic-shell="tight">
                <span>Skills</span>
              </h2>
              <p className="skills-showcase__subtitle">Slide to break the stack.</p>
            </header>
          </ScrollLinger>
        </div>
      </section>
    </SectionShell>
  )
}
