import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './SkillsSection.less'

gsap.registerPlugin(ScrollTrigger)

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cardOrder, setCardOrder] = useState<number[]>([1, 2, 0, 3, 4])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return


    gsap.set([titleBackRef.current, titleFrontRef.current].filter(Boolean), { x: 1.6, yPercent: 100 })




    // 标题入场动画（scrub 模式，前进后退都生效）
    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    titleTl
      .to(titleBackRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0)
      .to(titleFrontRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.04)

    // 卡片入场动画（单独触发，scrub 模式）
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom top',
        scrub: 1,
      },
    })
    cardTl.to(cardRefs.current.filter(Boolean), { y: 0, opacity: 1, duration: 0.6, stagger: 0.15 })

    // 滚动驱动卡片旋转
    const cards = cardRefs.current.filter(Boolean)
    cards.forEach((card, i) => {
      gsap.to(card, {
        rotation: `+=${i % 2 === 0 ? 15 : -15}`,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
          end: 'bottom top',
          scrub: 2,
        },
      })
    })

    // 标题淡出
    gsap.to([titleBackRef.current, titleFrontRef.current].filter(Boolean), {
      yPercent: -50,
      opacity: 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'center top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    return () => {
      titleTl.kill()
      cardTl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

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
    <section ref={sectionRef} className="skills-section" aria-labelledby="skills-section-title">
      <div className="skills-section__inner">
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
