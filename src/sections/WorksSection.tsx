import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './WorksSection.less'

export function WorksSection() {
  return (
    <SectionShell id="works">
      <div className="section-placeholder">
        <PlaceholderCard title="#works" subtitle="Works Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
