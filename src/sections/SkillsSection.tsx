import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './SkillsSection.less'

export function SkillsSection() {
  return (
    <SectionShell id="skills">
      <div className="section-placeholder">
        <PlaceholderCard title="#skills" subtitle="Skills Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
