import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroTitle } from './HeroTitle'
import { useHeroBackgroundMotion } from './useHeroBackgroundMotion'
import './HeroSection.less'

const backgroundGradientId = 'hero-background-gradient'
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
  const backgroundStopsRef = useRef<(SVGStopElement | null)[]>([])
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
    const stops = backgroundStopsRef.current.filter((stop): stop is SVGStopElement => Boolean(stop))

    if (!gradient || stops.length < 9) return

    let rafId = 0
    const start = window.performance.now()
    const baseOffsets = [0, 12, 24, 38, 50, 62, 76, 88, 100]

    const tick = (now: number) => {
      const elapsed = now - start
      const driftX = Math.sin(elapsed * 0.00012) * 16
      const driftY = Math.cos(elapsed * 0.0001) * 8
      const shear = Math.sin(elapsed * 0.00008) * 5
      const phase = elapsed * 0.00045

      gradient.setAttribute(
        'gradientTransform',
        `translate(${driftX.toFixed(2)} ${driftY.toFixed(2)}) skewX(${shear.toFixed(2)})`,
      )

      stops.forEach((stop, index) => {
        const wave = Math.sin(phase + index * 0.72) * 2.6
        const offset = Math.min(100, Math.max(0, baseOffsets[index] + wave))
        stop.setAttribute('offset', `${offset.toFixed(2)}%`)
      })

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
                x1="10%"
                y1="20%"
                x2="90%"
                y2="78%"
              >
                <stop ref={(el) => { backgroundStopsRef.current[0] = el }} offset="0%" stopColor="var(--hero-layer-a-1)" />
                <stop ref={(el) => { backgroundStopsRef.current[1] = el }} offset="12%" stopColor="var(--hero-layer-a-2)" stopOpacity="0.9" />
                <stop ref={(el) => { backgroundStopsRef.current[2] = el }} offset="24%" stopColor="var(--hero-layer-a-2)" />
                <stop ref={(el) => { backgroundStopsRef.current[3] = el }} offset="38%" stopColor="var(--hero-pink-soft)" stopOpacity="0.18" />
                <stop ref={(el) => { backgroundStopsRef.current[4] = el }} offset="50%" stopColor="var(--hero-pink-soft)" stopOpacity="0.42" />
                <stop ref={(el) => { backgroundStopsRef.current[5] = el }} offset="62%" stopColor="var(--hero-layer-a-3)" stopOpacity="0.88" />
                <stop ref={(el) => { backgroundStopsRef.current[6] = el }} offset="76%" stopColor="var(--hero-pink-soft)" stopOpacity="0.24" />
                <stop ref={(el) => { backgroundStopsRef.current[7] = el }} offset="88%" stopColor="var(--hero-layer-a-3)" />
                <stop ref={(el) => { backgroundStopsRef.current[8] = el }} offset="100%" stopColor="var(--hero-layer-a-4)" />
              </linearGradient>
            </defs>
            <path
              className="hero-section__background-base"
              d={backgroundBasePath}
              fill={`url(#${backgroundGradientId})`}
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
