import {useEffect, useRef, useState} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {Atom, Box, Code2, Gem, Server} from 'lucide-react'
import './SkillsSection.less'

gsap.registerPlugin(ScrollTrigger)

type PointerListener = {
  rotator: HTMLDivElement
  handlePointerMove: (event: PointerEvent) => void
  handlePointerLeave: () => void
}

const skills = [
    {id: 1, name: 'Flutter', category: '跨平台开发', color: '#02569B', Icon: Code2},
    {id: 2, name: 'React', category: '前端框架', color: '#61DAFB', Icon: Atom},
    {id: 3, name: 'Node.js', category: '后端运行时', color: '#339933', Icon: Server},
    {id: 4, name: 'Python', category: '全栈开发', color: '#3776AB', Icon: Gem},
    {id: 5, name: 'Three.js', category: '3D 可视化', color: '#49D0C7', Icon: Box},
]

const initialCardOrder = [1, 2, 0, 3, 4]

export function SkillsSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const rotatorRefs = useRef<(HTMLDivElement | null)[]>([])
  const [cardOrder, setCardOrder] = useState<number[]>(initialCardOrder)
  const [activeIndex, setActiveIndex] = useState(initialCardOrder[2])

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

      // 卡片交互效果
      const rotators = rotatorRefs.current.filter((rotator): rotator is HTMLDivElement => rotator !== null)
      const listeners: PointerListener[] = []

      rotators.forEach((rotator, i) => {
          const card = rotator.closest('.skills-card')
          if (!card) return

          // 设置技能颜色 CSS 变量
          const skill = skills[i]
          if (skill?.color) {
              rotator.style.setProperty('--card-color', skill.color)
          }

          const handlePointerMove = (e: PointerEvent) => {
              const rect = card.getBoundingClientRect()
              const pointerX = ((e.clientX - rect.left) / rect.width) * 100
              const pointerY = ((e.clientY - rect.top) / rect.height) * 100
              const centerX = pointerX - 50
              const centerY = pointerY - 50

              rotator.style.setProperty('--pointer-x', `${pointerX}%`)
              rotator.style.setProperty('--pointer-y', `${pointerY}%`)
              rotator.style.setProperty('--tilt-x', `${-centerY / 3.5}deg`)
              rotator.style.setProperty('--tilt-y', `${centerX / 3.5}deg`)
              rotator.style.setProperty('--effect-intensity', '1')
          }

          const handlePointerLeave = () => {
              rotator.style.setProperty('--pointer-x', '50%')
              rotator.style.setProperty('--pointer-y', '50%')
              rotator.style.setProperty('--tilt-x', '0deg')
              rotator.style.setProperty('--tilt-y', '0deg')
              rotator.style.setProperty('--effect-intensity', '0')
          }

          rotator.addEventListener('pointermove', handlePointerMove)
          rotator.addEventListener('pointerleave', handlePointerLeave)
          rotator.addEventListener('pointercancel', handlePointerLeave)
          listeners.push({rotator, handlePointerMove, handlePointerLeave})
      })

    return () => {
      titleTl.kill()
      cardTl.kill()
      listeners.forEach(({rotator, handlePointerMove, handlePointerLeave}) => {
        rotator.removeEventListener('pointermove', handlePointerMove)
        rotator.removeEventListener('pointerleave', handlePointerLeave)
        rotator.removeEventListener('pointercancel', handlePointerLeave)
      })
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
    setActiveIndex(newOrder[2])
  }

  const goPrev = () => {
    const newOrder = [...cardOrder]
    const last = newOrder.pop()!
    newOrder.unshift(last)
    animateToOrder(newOrder)
    setCardOrder(newOrder)
    setActiveIndex(newOrder[2])
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
                  <div
                      ref={(el) => {
                          rotatorRefs.current[cardIndex] = el
                      }}
                      className="skills-card__rotator"
                      style={{'--card-color': skills[cardIndex].color} as React.CSSProperties}
                  >
                      <div className="skills-card__inner">
                          <div style={{color: skills[cardIndex].color}}>
                              {(() => {
                                  const Icon = skills[cardIndex].Icon
                                  return <Icon size={48} strokeWidth={2}/>
                              })()}
                          </div>
                          <div className="skills-card__placeholder">
                              <div style={{color: skills[cardIndex].color}}>{skills[cardIndex].name}</div>
                              <div style={{
                                  fontSize: '0.75rem',
                                  marginTop: '0.5rem',
                                  color: 'rgba(45,55,72,0.7)'
                              }}>{skills[cardIndex].category}</div>
                          </div>
                      </div>
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
            {skills.map((_, i) => (
              <div
                key={i}
                className={`skills-section__dot${i === activeIndex ? ' skills-section__dot--active' : ''}`}
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
