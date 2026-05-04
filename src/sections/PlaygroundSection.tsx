import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './PlaygroundSection.less'

export function PlaygroundSection() {
  return (
    <SectionShell id="playground">
      <div className="section-placeholder">
        <PlaceholderCard title="#playground" subtitle="Playground Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
