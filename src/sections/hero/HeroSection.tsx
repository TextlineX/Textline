import { SectionShell } from '../../components/shared/SectionShell'
import { useMagneticCursor } from '../../hooks/cursor/useMagneticCursor'
import { StageBackdrop } from '../../effects/StageBackdrop'
import { GooeyReveal } from '../../effects/hero/GooeyReveal'
import { CharacterSphere } from './CharacterSphere'
import { NameBanner } from './NameBanner'
import { useBootContext } from '../../components/layout/BootContext'
import { useSectionWindow } from '../../hooks/useSectionWindow'
import './HeroSection.less'

export function HeroSection() {
  const { isActive, isPreloaded } = useSectionWindow({ sectionIndex: 0, preloadBefore: 2, preloadAfter: 2 })
  const { interactiveReady } = useBootContext()
  const { avatarActive } = useMagneticCursor({ enabled: interactiveReady })
  const sceneEnabled = isPreloaded || isActive

  return (
    <SectionShell id="hero">
      <div className="hero-shell">
        <StageBackdrop enabled={sceneEnabled} />
        <div className="hero-shell__stage">
          <CharacterSphere
            enabled={sceneEnabled}
          />
          <NameBanner />
          <GooeyReveal active={avatarActive} delayMs={220} />
        </div>
      </div>
    </SectionShell>
  )
}
