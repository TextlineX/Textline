import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroTitle } from './HeroTitle'
import { useHeroBackgroundMotion } from './useHeroBackgroundMotion'
import './HeroSection.less'

type HeroSectionProps = {
  introReady: boolean
}

export function HeroSection({ introReady }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const topBackgroundRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const wordNodesRef = useRef<HTMLElement[]>([])
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [introComplete, setIntroComplete] = useState(false)

  useHeroBackgroundMotion({ stageRef })

  // 入场动画
  useLayoutEffect(() => {
    const stage = stageRef.current
    const title = titleRef.current

    if (!stage || !title) return

    const wordNodes = Array.from(stage.querySelectorAll<HTMLElement>('[data-word]'))
    wordNodesRef.current = wordNodes

    gsap.set(wordNodes, { y: 24 })

    return () => {
      wordNodesRef.current = []
    }
  }, [])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current

    if (!stage || !topBackground || !title || !introReady || introComplete) return

    const wordNodes = wordNodesRef.current

    const introTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => setIntroComplete(true),
    })

    introTimeline
      .to(topBackground, { opacity: 1, duration: 0.45 })
      .to(title, { opacity: 1, duration: 0.3 }, 0)
      .to(wordNodes, { opacity: 1, y: 0, stagger: 0.06, duration: 0.62 }, 0.06)

    return () => {
      introTimeline.kill()
    }
  }, [introReady, introComplete])

  // 滚动视差效果
  useLayoutEffect(() => {
    if (!introComplete) return

    const section = sectionRef.current
    const wordNodes = wordNodesRef.current

    if (!section || wordNodes.length === 0) return

    // 标题视差滚动
    const titleTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    })

    titleTimeline
      .fromTo(
        titleRef.current,
        { y: 0, opacity: 1 },
        { y: -120, opacity: 0.2, ease: 'none' },
        0
      )
      .fromTo(
        wordNodes,
        { y: 0, opacity: 1 },
        { y: -80, opacity: 0.5, stagger: 0.02, ease: 'none' },
        0
      )

    scrollTimelineRef.current = titleTimeline

    // 背景渐隐
    gsap.to(topBackgroundRef.current, {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: '20% top',
        end: '60% top',
        scrub: true,
      },
    })

    return () => {
      titleTimeline.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [introComplete])

  return (
    <section ref={sectionRef} className="hero-section" aria-label="Hero section">
      <div ref={stageRef} className="hero-section__stage">
        <div ref={topBackgroundRef} className="hero-section__background" aria-hidden="true" />
        <HeroTitle titleRef={titleRef} />
      </div>
    </section>
  )
}
