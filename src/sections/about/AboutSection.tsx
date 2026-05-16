import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

import { useScrollScope } from '../../hooks/scroll'
import './AboutSection.less'

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const markRef = useRef<HTMLDivElement | null>(null)
  const textLine1Ref = useRef<HTMLDivElement | null>(null)
  const textLine2Ref = useRef<HTMLDivElement | null>(null)
  const textLine3Ref = useRef<HTMLDivElement | null>(null)
  const textLine4Ref = useRef<HTMLDivElement | null>(null)
  const textLine5Ref = useRef<HTMLDivElement | null>(null)
  const textLine6Ref = useRef<HTMLDivElement | null>(null)
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null)

  const { ref: scrollRef } = useScrollScope({
    id: 'home-about',
    enabled: true,
    touchEnabled: true,
    sensitivity: 0.0025,
    damping: 0.12,
    clamp: [0, 1] as [number, number],
    activationRatio: 0.25,
    onProgress: (value: number) => {
      if (introTimelineRef.current) {
        introTimelineRef.current.progress(value)
      }
      if (scrollTimelineRef.current) {
        scrollTimelineRef.current.progress(value)
      }
    },
  })

  useLayoutEffect(() => {
    const targets = [
      titleBackRef.current,
      titleFrontRef.current,
      markRef.current,
      textLine1Ref.current,
      textLine2Ref.current,
      textLine3Ref.current,
      textLine4Ref.current,
      textLine5Ref.current,
      textLine6Ref.current,
    ]
    targets.forEach((el) => {
      if (el) gsap.set(el, { x: 1.6, yPercent: 100 })
    })

    const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    introTl
      .to(titleBackRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0)
      .to(titleFrontRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.04)
      .to(markRef.current, { x: 1.6, yPercent: 0, duration: 0.82 }, 0.12)
      .to(textLine1Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.2)
      .to(textLine2Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.26)
      .to(textLine3Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.32)
      .to(textLine4Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.38)
      .to(textLine5Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.44)
      .to(textLine6Ref.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.5)

    introTimelineRef.current = introTl

    const allText = [textLine1Ref.current, textLine2Ref.current, textLine3Ref.current, textLine4Ref.current, textLine5Ref.current, textLine6Ref.current]
    if (allText.every((el) => el !== null)) {
      const scrollTl = gsap.timeline({ defaults: { ease: 'none' } })
      scrollTl.fromTo(allText, { opacity: 1 }, { opacity: 0.4, duration: 1 }, 0)
      scrollTimelineRef.current = scrollTl
    }

    return () => {
      introTl.kill()
    }
  }, [])

  return (
    <section ref={scrollRef} className="about-section" aria-labelledby="about-section-title">
      <div ref={sectionRef} className="about-section__inner">
        <div className="about-section__title-stack" aria-hidden="true">
          <h1 ref={titleBackRef} className="about-section__title about-section__title--back" id="about-section-title">
            ABOUT
          </h1>
          <h1 ref={titleFrontRef} className="about-section__title about-section__title--front">
            ABOUT
          </h1>
        </div>

        <div ref={markRef} className="about-section__mark" aria-hidden="true">
          <div className="about-section__ring about-section__ring--outer" />
          <div className="about-section__ring about-section__ring--inner" />
        </div>

        <div className="about-section__text-layer" aria-hidden="true">
          <div ref={textLine1Ref} className="about-section__text about-section__text--left about-section__text--hand">
            我是Textline
          </div>
          <div ref={textLine2Ref} className="about-section__text about-section__text--left">
            一个持续学习、
          </div>
          <div ref={textLine3Ref} className="about-section__text about-section__text--left">
            前端、后端、自动化、
          </div>
          <div ref={textLine4Ref} className="about-section__text about-section__text--right">
            持续创作的开发者
          </div>
          <div ref={textLine5Ref} className="about-section__text about-section__text--right">
            3D、工具化都在做
          </div>
          <div ref={textLine6Ref} className="about-section__text about-section__text--center">
            我做的不是单一作品，而是可持续演化的系统
          </div>
        </div>
      </div>
    </section>
  )
}