import { type CSSProperties, type RefObject } from 'react'

import { heroWordRows } from './heroContent'

type HeroTitleProps = {
  titleRef: RefObject<HTMLDivElement | null>
}

export function HeroTitle({ titleRef }: HeroTitleProps) {
  const rows = heroWordRows

  return (
    <div ref={titleRef} className="hero-section__title" aria-label="Hero title">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className={`hero-section__row hero-section__row--${rowIndex + 1}`}>
          {row.map((word) => (
            <div key={word.id} className="hero-section__word-box" data-word={word.id}>
              <span
                className={`hero-section__word ${word.colorClass} ${word.weightClass}${word.id === 'render' ? ' hero-section__word--render' : ''}`}
                style={
                  {
                    fontSize: `${word.fontSize}px`,
                    lineHeight: `${word.lineHeight}px`,
                    letterSpacing: word.letterSpacing,
                  } as CSSProperties
                }
              >
                {word.label}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
