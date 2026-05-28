import { type CSSProperties, type RefObject } from 'react'

import { heroWordRows } from './heroContent'

type HeroTitleProps = {
  titleRef: RefObject<HTMLDivElement | null>
  wordShellRefs: RefObject<(HTMLSpanElement | null)[]>
  wordActiveRefs: RefObject<(HTMLSpanElement | null)[]>
}

export function HeroTitle({ titleRef, wordShellRefs, wordActiveRefs }: HeroTitleProps) {
  let flatIndex = 0

  return (
    <div ref={titleRef} className="hero-section__title" aria-label="Hero title">
      {heroWordRows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className={`hero-section__row hero-section__row--${rowIndex + 1}`}>
          {row.map((word) => {
            const index = flatIndex++

            return (
              <span
                key={word.id}
                ref={(el) => {
                  wordShellRefs.current[index] = el
                }}
                className="hero-section__word-shell"
                data-word-shell={word.id}
                style={
                  {
                    '--hero-word-font-size': `${word.fontSize}px`,
                    '--hero-word-line-height': `${word.lineHeight}px`,
                    '--hero-word-letter-spacing': word.letterSpacing,
                  } as CSSProperties
                }
              >
                <span
                  className={`hero-section__word hero-section__word--base ${word.colorClass} ${word.weightClass}${word.id === 'render' ? ' hero-section__word--render' : ''}`}
                >
                  {word.label}
                </span>
                <span
                  ref={(el) => {
                    wordActiveRefs.current[index] = el
                  }}
                  className={`hero-section__word hero-section__word--active ${word.weightClass}${word.id === 'render' ? ' hero-section__word--render-active' : ''}`}
                  aria-hidden="true"
                  style={
                    {
                      '--hero-word-active-color': word.activeColor,
                    } as CSSProperties
                  }
                >
                  {word.label}
                </span>
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
