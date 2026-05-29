import {HeroSection} from '../../sections/hero/HeroSection'
import {AboutSection} from '../../sections/about'
import {SkillsSection} from '../../sections/skills'
import {WorksSection} from '../../sections/works'
import {Catalog} from '../../sections/catalog'
import {ContactSection} from '../../sections/contact/ContactSection'
import {FloatingBar} from '../../components/shared/FloatingBar'
import './HomePage.less'


type HomePageProps = {
  isBootComplete: boolean
}

export function HomePage({ isBootComplete }: HomePageProps) {
  return (
    <main className="home-page">
      <FloatingBar />
      <HeroSection introReady={isBootComplete} />
      <section className="home-page__about-gap" aria-label="About spacer">
        <div className="home-page__about-gap-label" aria-hidden="true">
        </div>
      </section>
      <AboutSection />
        <section className="home-page__skills-gap" aria-label="Skills spacer">
            <div className="home-page__gap-label" aria-hidden="true">
            </div>
        </section>
      <SkillsSection />
        <section className="home-page__works-gap" aria-label="Works spacer">
            <div className="home-page__gap-label" aria-hidden="true">
            </div>
        </section>
      <WorksSection />
      <Catalog />
      <ContactSection />
    </main>
  )
}