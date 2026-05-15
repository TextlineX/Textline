import { useEffect, useState } from 'react'

import '../../App.less'

import { AppShell } from '../../components/layout/AppShell'
import { BootProvider } from '../../components/layout/BootProvider'
import { LoadingScreen } from '../../components/shared/LoadingScreen'
import { AboutSection } from '../../sections/about'
import { ContactSection } from '../../sections/contact'
import { ExperienceSection } from '../../sections/experience'
import { HeroSection } from '../../sections/hero'
import { PlaygroundSection } from '../../sections/playground'
import { SkillsSection } from '../../sections/skills'
import { WorksSection } from '../../sections/works'

export function HomePage() {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)
  const [loadingDismissed, setLoadingDismissed] = useState(false)

  useEffect(() => {
    const minimumVisibleMs = 2200
    const timerId = window.setTimeout(() => {
      setMinElapsed(true)
    }, minimumVisibleMs)

    const markLoaded = () => {
      setHasLoaded(true)
    }

    if (document.readyState === 'complete') {
      markLoaded()
    } else {
      window.addEventListener('load', markLoaded, { once: true })
    }

    return () => {
      window.clearTimeout(timerId)
      window.removeEventListener('load', markLoaded)
    }
  }, [])

  const loadingReady = hasLoaded && minElapsed
  const interactiveReady = loadingDismissed

  return (
    <BootProvider bootComplete={loadingReady} interactiveReady={interactiveReady}>
      {!loadingDismissed ? (
        <LoadingScreen
          active={!loadingDismissed}
          phase={loadingReady ? 'success' : 'loading'}
          onRevealComplete={() => {
            setLoadingDismissed(true)
          }}
        />
      ) : null}
      <AppShell>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <WorksSection />
        <ExperienceSection />
        <PlaygroundSection />
        <ContactSection />
      </AppShell>
    </BootProvider>
  )
}
