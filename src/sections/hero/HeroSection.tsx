import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroTitle } from './HeroTitle'
import { useHeroBackgroundMotion } from './useHeroBackgroundMotion'
import './HeroSection.less'

const backgroundGradientId = 'hero-background-gradient'
const backgroundBasePath =
  'M 0 0 H 1440 V 640 C 1324 628 1270 692 1168 690 C 1062 688 1010 622 906 626 C 806 630 750 710 642 706 C 534 702 480 620 382 622 C 270 626 212 704 110 696 C 54 692 22 672 0 668 Z'
const backgroundWavePath =
  'M 0 628 C 136 602 214 664 336 652 C 450 640 518 582 650 596 C 782 610 840 680 968 668 C 1094 656 1180 590 1298 604 C 1372 612 1410 624 1440 620 V 900 H 0 Z'
const backgroundSheenPath =
  'M 0 560 C 160 528 240 578 362 566 C 494 552 556 516 686 528 C 812 540 868 598 992 586 C 1116 574 1204 522 1322 536 C 1378 544 1410 552 1440 548 V 632 C 1324 640 1268 692 1168 690 C 1062 688 1010 622 906 626 C 806 630 750 710 642 706 C 534 702 480 620 382 622 C 270 626 212 704 110 696 C 54 692 22 672 0 668 Z'

type HeroSectionProps = {
  introReady: boolean
}

export function HeroSection({ introReady }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const visualRef = useRef<HTMLDivElement | null>(null)
  const topBackgroundRef = useRef<SVGSVGElement | null>(null)
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
    gsap.set(topBackground, { opacity: 0, scale: 1.08, yPercent: 0 })
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
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
        .fromTo(visual, { height: '47.95%' }, { height: '100%', ease: 'none' }, 0)
        .fromTo(topBackground, { yPercent: 0, scale: 1.08 }, { yPercent: -18, scale: 1.2, ease: 'none' }, 0)
        .fromTo(title, { y: 0 }, { y: -180, ease: 'none' }, 0.14)
        .fromTo(wordShellNodes, { y: 0 }, { y: -120, stagger: 0.02, ease: 'none' }, 0.14)

      wordActiveNodes.forEach((active, index) => {
        scrollTl.to(
          active,
          {
            clipPath: 'inset(0% 0 0 0)',
            ease: 'none',
            duration: 0.1,
          },
          0.12 + index * 0.04,
        )
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [introComplete])

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
              <linearGradient id={backgroundGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'var(--hero-layer-a-1)' }} />
                <stop offset="20%" style={{ stopColor: 'var(--hero-layer-a-2)' }} />
                <stop offset="50%" style={{ stopColor: 'var(--hero-layer-a-3)' }} />
                <stop offset="100%" style={{ stopColor: 'var(--hero-layer-a-4)' }} />
              </linearGradient>
            </defs>
            <path
              className="hero-section__background-base"
              d={backgroundBasePath}
              fill={`url(#${backgroundGradientId})`}
            />
            <path
              className="hero-section__background-wave"
              d={backgroundWavePath}
              fill={`url(#${backgroundGradientId})`}
            />
            <path
              className="hero-section__background-sheen"
              d={backgroundSheenPath}
              fill="rgba(255, 255, 255, 0.08)"
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
