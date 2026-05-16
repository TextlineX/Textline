import { useRef, useState } from 'react'
import gsap from 'gsap'

import { useScrollScope } from '../../hooks/scroll'
import './SkillsSection.less'

export function SkillsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [cardOrder, setCardOrder] = useState<number[]>([1, 2, 0, 3, 4])

  const { ref: scrollRef } = useScrollScope({
    id: 'home-skills',
    enabled: true,
    touchEnabled: true,
    sensitivity: 0.0025,
    damping: 0.12,
    clamp: [0, 1] as [number, number],
    activationRatio: 0.25,
    onProgress: (value: number) => {
      if (introTimelineRef.current) introTimelineRef.current.progress(value)
      if (scrollTimelineRef.current) scrollTimelineRef.current.progress(value)
    },
  })

  const getTransform = (slotIndex: number) => {
    const offset = slotIndex - 2
    const rotate = offset * 10
    const x = offset * 180
    const y = Math.abs(offset) * 48
    const scale = 1 - Math.abs(offset) * 0.1
    return { rotate, x, y, scale }
  }

  const animateToOrder = (newOrder: number[]) => {
    newOrder.forEach((cardIndex, slotIndex) => {
      const card = cardRefs.current[cardIndex]
      if (!card) return
      const { rotate, x, y, scale } = getTransform(slotIndex)
      gsap.to(card, {
        rotate,
        x,
        y,
        scale,
        duration: 0.44,
        ease: 'back.out(1.2)',
      })
    })
  }

  const goNext = () => {
    const newOrder = [...cardOrder]
    const first = newOrder.shift()!
    newOrder.push(first)
    animateToOrder(newOrder)
    setCardOrder(newOrder)
  }

  const goPrev = () => {
    const newOrder = [...cardOrder]
    const last = newOrder.pop()!
    newOrder.unshift(last)
    animateToOrder(newOrder)
    setCardOrder(newOrder)
  }

  return (
    <section ref={scrollRef} className="skills-section" aria-labelledby="skills-section-title">
      <div ref={sectionRef} className="skills-section__inner">
        <div className="skills-section__title-stack" aria-hidden="true">
          <h1 ref={titleBackRef} className="skills-section__title skills-section__title--back" id="skills-section-title">
            SKILLS
          </h1>
          <h1 ref={titleFrontRef} className="skills-section__title skills-section__title--front">
            SKILLS
          </h1>
        </div>

        <div className="skills-section__stage">
          {cardOrder.map((cardIndex, slotIndex) => {
            const { rotate, x, y, scale } = getTransform(slotIndex)
            const zIndex = slotIndex === 2 ? 100 : 1
            return (
              <div
                key={cardIndex}
                ref={(el) => { cardRefs.current[cardIndex] = el }}
                className="skills-card"
                style={{ transform: `rotate(${rotate}deg) translateX(${x}px) translateY(${y}px) scale(${scale})`, zIndex }}
              >
                <div className="skills-card__inner">
                  <span className="skills-card__num">{cardIndex + 1}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="skills-section__controls">
          <button className="skills-section__arrow" onClick={goPrev} aria-label="Previous">
            ‹
          </button>
          <div className="skills-section__dots" aria-label="Card navigation">
            {cardOrder.map((cardIndex, i) => (
              <div
                key={cardIndex}
                className={`skills-section__dot${i === 0 ? ' skills-section__dot--active' : ''}`}
              />
            ))}
          </div>
          <button className="skills-section__arrow" onClick={goNext} aria-label="Next">
            ›
          </button>
        </div>
      </div>
    </section>
  )
}