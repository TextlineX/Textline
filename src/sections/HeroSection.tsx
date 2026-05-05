import { SectionShell } from '../components/shared/SectionShell'
import { useMagneticCursor } from '../hooks/cursor/useMagneticCursor'
import { MagneticCursor } from '../effects/cursor/MagneticCursor'
import { StageBackdrop } from '../effects/StageBackdrop'
import { GooeyReveal } from '../effects/hero/GooeyReveal'
import { CharacterSphere } from './hero/CharacterSphere'
import { NameBanner } from './hero/NameBanner'
import './HeroSection.less'

export function HeroSection() {
  const { position, locked, avatarActive, size, mode } = useMagneticCursor({ enabled: true })

  return (
    <SectionShell id="hero">
      <div className="hero-shell">
        <StageBackdrop />
        <div className="hero-shell__stage">
          <CharacterSphere />
          <NameBanner />
          <GooeyReveal active={avatarActive} delayMs={220} />
        </div>
      </div>
      <MagneticCursor
        x={position.x}
        y={position.y}
        locked={locked}
        width={size.width}
        height={size.height}
        mode={mode}
      />
    </SectionShell>
  )
}
