import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './AboutSection.less'

export function AboutSection() {
  return (
    <SectionShell id="about">
      <div className="section-placeholder">
        <PlaceholderCard title="#about" subtitle="About Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
