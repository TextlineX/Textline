import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './AboutSection.less'

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const markRef = useRef<HTMLDivElement | null>(null)
  const textLine1Ref = useRef<HTMLDivElement | null>(null)
  const textLine2Ref = useRef<HTMLDivElement | null>(null)
  const textLine3Ref = useRef<HTMLDivElement | null>(null)
  const textLine4Ref = useRef<HTMLDivElement | null>(null)
  const textLine5Ref = useRef<HTMLDivElement | null>(null)
  const textLine6Ref = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

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
    ].filter(Boolean)

    gsap.set(targets, { x: 1.6, yPercent: 100 })

    // 入场动画
    const introTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    })

    introTl
      .to(titleBackRef.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0)
      .to(titleFrontRef.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.04)
      .to(markRef.current, { x: 1.6, yPercent: 0, duration: 0.82, ease: 'power3.out' }, 0.12)
      .to(textLine1Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.2)
      .to(textLine2Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.26)
      .to(textLine3Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.32)
      .to(textLine4Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.38)
      .to(textLine5Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.44)
      .to(textLine6Ref.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.5)

    // 滚动淡出效果
    const textLines = [
      textLine1Ref.current,
      textLine2Ref.current,
      textLine3Ref.current,
      textLine4Ref.current,
      textLine5Ref.current,
      textLine6Ref.current,
    ].filter(Boolean)

    gsap.to(textLines, {
      opacity: 0.3,
      y: (i) => -30 - i * 15,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'center center',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    // 标题滚动淡出
    gsap.to([titleBackRef.current, titleFrontRef.current].filter(Boolean), {
      y: -100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'center top',
        scrub: 1,
      },
    })

    // Mark 旋转动画
    gsap.to(markRef.current, {
      rotation: '+=360',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    })

    return () => {
      introTl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="about-section" aria-labelledby="about-section-title">
      <div className="about-section__inner">
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
