import { SectionShell } from '../components/shared/SectionShell'
import { StickyMagneticTitle } from '../components/shared/StickyMagneticTitle'
import './ContactSection.less'

export function ContactSection() {
  return (
    <SectionShell id="contact">
      <section className="contact-showcase" aria-labelledby="contact-showcase-title">
        <StickyMagneticTitle
          as="h2"
          id="contact-showcase-title"
          className="contact-showcase__title-linger"
          sectionIndex={6}
          anchorVh={0.16}
          blurDelayVh={0.08}
          blurSpanVh={0.1}
          blurMaxPx={4}
          followDelayVh={0.02}
          followEase={0.9}
          targetClassName="contact-showcase__title"
          stickTopVh={0.08}
          lingerVh={0.18}
          releaseVh={0.14}
          fadeVh={0.16}
        >
          <span>Contact</span>
        </StickyMagneticTitle>
      </section>
    </SectionShell>
  )
}
