import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'

import { useScrollScope } from '../../hooks/scroll'
import { HeroTitle } from './HeroTitle'
import { useHeroBackgroundMotion } from './useHeroBackgroundMotion'
import './HeroSection.less'

type HeroSectionProps = {
  introReady: boolean
}

export function HeroSection({ introReady }: HeroSectionProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const topBackgroundRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const wordNodesRef = useRef<HTMLElement[]>([])
  const scrollTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [introComplete, setIntroComplete] = useState(false)

  const { ref } = useScrollScope(
    useMemo(
      () => ({
        id: 'home-hero',
        enabled: introComplete,
        touchEnabled: true,
        sensitivity: 0.0025,
        damping: 0.12,
        clamp: [0, 1] as [number, number],
        activationRatio: 0.25,
        onProgress: (value: number) => {
          scrollTimelineRef.current?.progress(value)
        },
      }),
      [introComplete],
    ),
  )

  useHeroBackgroundMotion({ stageRef })

  useLayoutEffect(() => {
    const stage = stageRef.current
    const title = titleRef.current

    if (!stage || !title) {
      return
    }

    const wordNodes = Array.from(stage.querySelectorAll<HTMLElement>('[data-word]'))
    wordNodesRef.current = wordNodes

    gsap.set(wordNodes, {
      y: 24,
    })

    return () => {
      wordNodesRef.current = []
    }
  }, [])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current

    if (!stage || !topBackground || !title || !introReady || introComplete) {
      return
    }

    const wordNodes = wordNodesRef.current

    const introTimeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
      onComplete: () => {
        setIntroComplete(true)
      },
    })

    introTimeline
      .to(topBackground, {
        opacity: 1,
        duration: 0.45,
      })
      .to(
        title,
        {
          opacity: 1,
          duration: 0.3,
        },
        0,
      )
      .to(
        wordNodes,
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.62,
        },
        0.06,
      )

    return () => {
      introTimeline.kill()
    }
  }, [introReady, introComplete])

  useLayoutEffect(() => {
    if (!introComplete) {
      return
    }

    const wordNodes = wordNodesRef.current

    if (wordNodes.length === 0) {
      return
    }

    const scrollTimeline = gsap.timeline({
      paused: true,
      defaults: {
        ease: 'none',
      },
    })

    scrollTimeline.fromTo(
      wordNodes,
      {
        y: 0,
        opacity: 1,
      },
      {
        y: -14,
        opacity: 0.94,
        stagger: 0.015,
        duration: 1,
      },
      0,
    )

    scrollTimelineRef.current = scrollTimeline

    return () => {
      scrollTimeline.kill()
      scrollTimelineRef.current = null
    }
  }, [introComplete])

  return (
    <section ref={ref} className="hero-section" aria-label="Hero section">
      <div ref={stageRef} className="hero-section__stage">
        <div ref={topBackgroundRef} className="hero-section__background" aria-hidden="true" />
        <HeroTitle titleRef={titleRef} />
      </div>
    </section>
  )
}
