import { useEffect, useState } from 'react'

import './App.less'
import './styles/test.less'

import { AppShell } from './components/layout/AppShell'
import { LoadingScreen } from './components/shared/LoadingScreen'
import { AboutSection } from './sections/AboutSection'
import { ContactSection } from './sections/ContactSection'
import { ExperienceSection } from './sections/ExperienceSection'
import { HeroSection } from './sections/HeroSection'
import { PlaygroundSection } from './sections/PlaygroundSection'
import { SkillsSection } from './sections/SkillsSection'
import { WorksSection } from './sections/WorksSection'

function App() {
  const [hasLoaded, setHasLoaded] = useState(false)
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const minimumVisibleMs = 900
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

  return (
    <>
      <LoadingScreen active={!(hasLoaded && minElapsed)} />
      <AppShell>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <WorksSection />
        <ExperienceSection />
        <PlaygroundSection />
        <ContactSection />
      </AppShell>
    </>
  )
}

export default App
