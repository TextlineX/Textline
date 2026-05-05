import { heroNameDataset } from '../../data/heroNameDataset'
import { heroConfig } from '../../data/heroConfig'
import { useBootContext } from '../../components/layout/BootContext'
import { StickyMagneticTitle } from '../../components/shared/StickyMagneticTitle'
import { useTextScatter } from '../../hooks/hero/useTextScatter'
import './NameBanner.less'

type NameBannerProps = {
  label?: string
}

export function NameBanner({ label = heroConfig.displayName }: NameBannerProps) {
  const { bootComplete } = useBootContext()
  const { letters } = useTextScatter({
    text: label,
    dataset: heroNameDataset,
    durationMs: heroConfig.introDurationMs,
    intervalMs: 90,
    enabled: bootComplete,
  })

  return (
    <header className="name-banner" aria-label="hero name">
      <div className="name-banner__mask" aria-hidden="true" />
      <StickyMagneticTitle
        className="name-banner__linger"
        debugLabel="hero-name"
        sectionIndex={0}
        anchorVh={0.48}
        blurDelayVh={0.18}
        blurSpanVh={0.16}
        blurMaxPx={8}
        followDelayVh={0.08}
        followEase={0.7}
        targetClassName="name-banner__label"
        magneticShell="tight"
        avatarTrigger
        aria-live="polite"
      >
        {letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className="name-banner__letter">
            {letter}
          </span>
        ))}
      </StickyMagneticTitle>
    </header>
  )
}
