import { heroNameDataset } from '../../data/heroNameDataset'
import { heroConfig } from '../../data/heroConfig'
import { useTextScatter } from '../../hooks/hero/useTextScatter'
import './NameBanner.less'

type NameBannerProps = {
  label?: string
}

export function NameBanner({ label = heroConfig.displayName }: NameBannerProps) {
  const { letters } = useTextScatter({
    text: label,
    dataset: heroNameDataset,
    durationMs: heroConfig.introDurationMs,
    intervalMs: 90,
  })

  return (
    <header className="name-banner" aria-label="hero name">
      <div className="name-banner__mask" aria-hidden="true" />
      <div
        className="name-banner__label magnetic-target"
        data-magnetic-shell="tight"
        data-avatar-trigger="true"
        aria-live="polite"
      >
        {letters.map((letter, index) => (
          <span key={`${letter}-${index}`} className="name-banner__letter">
            {letter}
          </span>
        ))}
      </div>
    </header>
  )
}
