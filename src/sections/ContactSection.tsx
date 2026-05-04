import { SectionShell } from '../components/shared/SectionShell'
import { PlaceholderCard } from '../components/shared/PlaceholderCard'
import './ContactSection.less'

export function ContactSection() {
  return (
    <SectionShell id="contact">
      <div className="section-placeholder">
        <PlaceholderCard title="#contact" subtitle="Contact Section" lines={2} magnetic />
      </div>
    </SectionShell>
  )
}
