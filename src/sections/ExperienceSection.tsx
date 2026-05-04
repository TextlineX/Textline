import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './ExperienceSection.less'

export function ExperienceSection() {
  return (
    <SectionShell id="experience">
      <div className="section-placeholder">
        <PlaceholderCard title="#experience" subtitle="Experience Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
