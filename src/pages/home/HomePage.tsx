import { HeroSection } from '../../sections/hero/HeroSection'
import { AboutSection } from '../../sections/about'
import { SkillsSection } from '../../sections/skills'
import { WorksSection } from '../../sections/works'
import { FloatingBar } from '../../components/shared/FloatingBar'
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
      <SkillsSection />
      <WorksSection />
    </main>
  )
}