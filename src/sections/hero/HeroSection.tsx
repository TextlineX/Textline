import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroTitle } from './HeroTitle'
import { useHeroBackgroundMotion } from './useHeroBackgroundMotion'
import './HeroSection.less'

const backgroundGradientId = 'hero-background-gradient'
const backgroundMistGradientId = 'hero-background-mist-gradient'
const backgroundGlowGradientId = 'hero-background-glow-gradient'
const backgroundBasePath =
  'M 0 0 H 1440 V 640 C 1320 626 1272 680 1168 688 C 1064 696 1012 628 910 632 C 808 636 750 708 642 704 C 534 700 480 620 382 620 C 270 620 212 702 110 694 C 54 690 22 670 0 666 Z'

type HeroSectionProps = {
  introReady: boolean
}

export function HeroSection({ introReady }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const visualRef = useRef<HTMLDivElement | null>(null)
  const topBackgroundRef = useRef<SVGSVGElement | null>(null)
  const backgroundGradientRef = useRef<SVGLinearGradientElement | null>(null)
  const backgroundMistGradientRef = useRef<SVGRadialGradientElement | null>(null)
  const backgroundGlowGradientRef = useRef<SVGLinearGradientElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const wordShellRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordActiveRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [introComplete, setIntroComplete] = useState(false)

  useHeroBackgroundMotion({ stageRef })

  useLayoutEffect(() => {
    const visual = visualRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
    const wordActiveNodes = wordActiveRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!visual || !topBackground || !title) return

    gsap.set(visual, { height: '47.95%' })
    gsap.set(topBackground, { opacity: 0, scale: 1.06, yPercent: 0 })
    gsap.set(title, { opacity: 0, y: 18 })
    gsap.set(wordShellNodes, { opacity: 0, y: 24 })
    gsap.set(wordActiveNodes, { clipPath: 'inset(100% 0 0 0)' })
  }, [])

  useLayoutEffect(() => {
    const visual = visualRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!visual || !topBackground || !title || !introReady || introComplete) return

    const introTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        setIntroComplete(true)
        requestAnimationFrame(() => {
          ScrollTrigger.refresh()
        })
      },
    })

    introTimeline
      .to(topBackground, { opacity: 1, duration: 0.45 }, 0)
      .to(title, { opacity: 1, y: 0, duration: 0.35 }, 0)
      .to(wordShellNodes, { opacity: 1, y: 0, stagger: 0.06, duration: 0.62 }, 0.08)

    return () => {
      introTimeline.kill()
    }
  }, [introReady, introComplete])

  useLayoutEffect(() => {
    if (!introComplete) return

    const section = sectionRef.current
    const visual = visualRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
    const wordActiveNodes = wordActiveRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!section || !visual || !topBackground || !title || wordShellNodes.length === 0 || wordActiveNodes.length === 0) return

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top+=120 top',
          end: 'bottom top',
          scrub: 0.45,
          invalidateOnRefresh: true,
        },
      })
        .fromTo(visual, { height: '47.95%' }, { height: '100%', ease: 'none' }, 0)
        .fromTo(topBackground, { yPercent: 0, scale: 1.06 }, { yPercent: -10, scale: 1.12, ease: 'none' }, 0)
        .fromTo(title, { y: 0 }, { y: -180, ease: 'none' }, 0.14)
        .fromTo(wordShellNodes, { y: 0 }, { y: -120, stagger: 0.02, ease: 'none' }, 0.14)

      wordActiveNodes.forEach((active, index) => {
        scrollTl.to(
          active,
          {
            clipPath: 'inset(0% 0 0 0)',
            ease: 'none',
            duration: 0.06,
          },
          0.08 + index * 0.025,
        )
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [introComplete])

  useLayoutEffect(() => {
    const gradient = backgroundGradientRef.current
    const mistGradient = backgroundMistGradientRef.current
    const glowGradient = backgroundGlowGradientRef.current

    if (!gradient || !mistGradient || !glowGradient) return

    let rafId = 0
    const start = window.performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const baseX = Math.sin(elapsed * 0.00008) * 10
      const baseY = Math.cos(elapsed * 0.00007) * 6
      const mistX = Math.sin(elapsed * 0.00011 + 1.8) * 18
      const mistY = Math.cos(elapsed * 0.00009 + 0.6) * 8
      const glowX = Math.sin(elapsed * 0.00013 + 3.1) * 14
      const glowY = Math.cos(elapsed * 0.0001 + 1.4) * 7
      const baseShear = Math.sin(elapsed * 0.00005) * 3
      const mistShear = Math.cos(elapsed * 0.00006) * 4
      const glowShear = Math.sin(elapsed * 0.00004 + 0.9) * 2
      const baseScale = 1.01 + Math.sin(elapsed * 0.00003) * 0.01
      const mistScale = 1.08 + Math.cos(elapsed * 0.00004) * 0.015
      const glowScale = 1.04 + Math.sin(elapsed * 0.000035 + 0.8) * 0.012

      gradient.setAttribute(
        'gradientTransform',
        `translate(${baseX.toFixed(2)} ${baseY.toFixed(2)}) skewX(${baseShear.toFixed(2)}) scale(${baseScale.toFixed(4)})`,
      )
      mistGradient.setAttribute(
        'gradientTransform',
        `translate(${mistX.toFixed(2)} ${mistY.toFixed(2)}) skewX(${mistShear.toFixed(2)}) scale(${mistScale.toFixed(4)})`,
      )
      glowGradient.setAttribute(
        'gradientTransform',
        `translate(${glowX.toFixed(2)} ${glowY.toFixed(2)}) skewX(${glowShear.toFixed(2)}) scale(${glowScale.toFixed(4)})`,
      )

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <section ref={sectionRef} className="hero-section" aria-label="Hero section">
      <div ref={stageRef} className="hero-section__stage">
        <div ref={visualRef} className="hero-section__visual" aria-hidden="true">
          <svg
            ref={topBackgroundRef}
            className="hero-section__background"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                ref={backgroundGradientRef}
                id={backgroundGradientId}
                x1="8%"
                y1="16%"
                x2="88%"
                y2="74%"
              >
                <stop offset="0%" stopColor="var(--hero-layer-a-1)" />
                <stop offset="18%" stopColor="var(--hero-layer-a-2)" />
                <stop offset="42%" stopColor="var(--hero-pink-soft)" stopOpacity="0.26" />
                <stop offset="66%" stopColor="var(--hero-layer-a-3)" />
                <stop offset="100%" stopColor="var(--hero-layer-a-4)" />
              </linearGradient>
              <radialGradient
                ref={backgroundMistGradientRef}
                id={backgroundMistGradientId}
                cx="42%"
                cy="38%"
                r="72%"
              >
                <stop offset="0%" stopColor="var(--hero-pink-soft)" stopOpacity="0.24" />
                <stop offset="36%" stopColor="var(--hero-layer-a-2)" stopOpacity="0.08" />
                <stop offset="68%" stopColor="var(--hero-pink-soft)" stopOpacity="0.14" />
                <stop offset="100%" stopColor="var(--hero-layer-a-1)" stopOpacity="0" />
              </radialGradient>
              <linearGradient
                ref={backgroundGlowGradientRef}
                id={backgroundGlowGradientId}
                x1="16%"
                y1="70%"
                x2="84%"
                y2="34%"
              >
                <stop offset="0%" stopColor="var(--hero-layer-a-1)" stopOpacity="0" />
                <stop offset="28%" stopColor="var(--hero-pink-soft)" stopOpacity="0.12" />
                <stop offset="56%" stopColor="var(--hero-layer-a-3)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--hero-layer-a-1)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="hero-section__background-base"
              d={backgroundBasePath}
              fill={`url(#${backgroundGradientId})`}
            />
            <path
              className="hero-section__background-mist"
              d={backgroundBasePath}
              fill={`url(#${backgroundMistGradientId})`}
            />
            <path
              className="hero-section__background-glow"
              d={backgroundBasePath}
              fill={`url(#${backgroundGlowGradientId})`}
            />
          </svg>
        </div>
        <HeroTitle
          titleRef={titleRef}
          wordShellRefs={wordShellRefs}
          wordActiveRefs={wordActiveRefs}
        />
      </div>
    </section>
  )
}
