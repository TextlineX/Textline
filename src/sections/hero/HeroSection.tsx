import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { HeroTitle } from './HeroTitle'
import './HeroSection.less'

const backgroundBasePath =
  'M 0 0 H 1440 V 660 C 1320 646 1272 700 1168 708 C 1064 716 1012 648 910 652 C 808 656 750 728 642 724 C 534 720 480 640 382 640 C 270 640 212 722 110 714 C 54 710 22 690 0 686 Z'

type HeroGradientPalette = {
  base1: string
  base2: string
  base3: string
  base4: string
  pink: string
}

const heroGradientPalettes: Record<'light' | 'dark', HeroGradientPalette> = {
  light: {
    base1: '#dcd5dc',
    base2: '#c8c0ca',
    base3: '#a59cab',
    base4: '#7f7888',
    pink: '#e9a7c3',
  },
  dark: {
    base1: '#3f3942',
    base2: '#504759',
    base3: '#63576e',
    base4: '#7a6d85',
    pink: '#c87eab',
  },
}

function getHeroGradientPalette(): HeroGradientPalette {
  if (typeof document === 'undefined') {
    return heroGradientPalettes.light
  }

  const theme = document.documentElement.getAttribute('data-theme')

  if (theme === 'dark') {
    return heroGradientPalettes.dark
  }

  if (theme === 'light') {
    return heroGradientPalettes.light
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? heroGradientPalettes.dark
    : heroGradientPalettes.light
}

type HeroSectionProps = {
  introReady: boolean
}

export function HeroSection({ introReady }: HeroSectionProps) {
  const gradientPalette = getHeroGradientPalette()
  const sectionRef = useRef<HTMLElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
  const visualRef = useRef<HTMLDivElement | null>(null)
  const topBackgroundRef = useRef<SVGSVGElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const wordShellRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordActiveRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [introComplete, setIntroComplete] = useState(false)

  useLayoutEffect(() => {
    const visual = visualRef.current
    const topBackground = topBackgroundRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
    const wordActiveNodes = wordActiveRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!visual || !topBackground || !title) return

    gsap.set(visual, { clipPath: 'inset(0 0 52.05% 0)' })
    gsap.set(topBackground, { opacity: 0, yPercent: 0 })
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
        .fromTo(visual, { clipPath: 'inset(0 0 52.05% 0)' }, { clipPath: 'inset(0 0 0 0)', ease: 'none' }, 0)
        .fromTo(topBackground, { yPercent: 0 }, { yPercent: -10, ease: 'none' }, 0)
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
              <linearGradient id="hero-flow-base" x1="0%" y1="0%" x2="100%" y2="100%">
                <animate attributeName="x1" values="0%; 18%; 0%" dur="14s" repeatCount="indefinite" />
                <animate attributeName="y1" values="0%; 12%; 0%" dur="16s" repeatCount="indefinite" />
                <animate attributeName="x2" values="100%; 82%; 100%" dur="14s" repeatCount="indefinite" />
                <animate attributeName="y2" values="100%; 88%; 100%" dur="16s" repeatCount="indefinite" />

                <stop offset="0%" stopColor={gradientPalette.base1} />
                <stop offset="22%" stopColor={gradientPalette.base2} />
                <stop offset="44%" stopColor={gradientPalette.pink} stopOpacity="0.24" />
                <stop offset="72%" stopColor={gradientPalette.base3} />
                <stop offset="100%" stopColor={gradientPalette.base4} />
              </linearGradient>

              <radialGradient id="hero-flow-mist" cx="42%" cy="36%" r="72%">
                <animate attributeName="cx" values="42%; 56%; 42%" dur="18s" repeatCount="indefinite" />
                <animate attributeName="cy" values="36%; 48%; 36%" dur="20s" repeatCount="indefinite" />
                <animate attributeName="r" values="64%; 74%; 64%" dur="19s" repeatCount="indefinite" />

                <stop offset="0%" stopColor={gradientPalette.pink} stopOpacity="0.22" />
                <stop offset="34%" stopColor={gradientPalette.base2} stopOpacity="0.08" />
                <stop offset="68%" stopColor={gradientPalette.pink} stopOpacity="0.14" />
                <stop offset="100%" stopColor={gradientPalette.base1} stopOpacity="0" />
              </radialGradient>

              <linearGradient id="hero-flow-glow" x1="16%" y1="70%" x2="84%" y2="30%">
                <animate attributeName="x1" values="16%; 26%; 16%" dur="22s" repeatCount="indefinite" />
                <animate attributeName="y1" values="70%; 60%; 70%" dur="18s" repeatCount="indefinite" />
                <animate attributeName="x2" values="84%; 74%; 84%" dur="22s" repeatCount="indefinite" />
                <animate attributeName="y2" values="30%; 40%; 30%" dur="18s" repeatCount="indefinite" />

                <stop offset="0%" stopColor={gradientPalette.base1} stopOpacity="0" />
                <stop offset="34%" stopColor={gradientPalette.pink} stopOpacity="0.12">
                  <animate attributeName="stop-opacity" values="0.08; 0.16; 0.08" dur="10s" repeatCount="indefinite" />
                </stop>
                <stop offset="62%" stopColor={gradientPalette.base3} stopOpacity="0.12" />
                <stop offset="100%" stopColor={gradientPalette.base1} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="hero-section__background-base"
              d={backgroundBasePath}
              fill="url(#hero-flow-base)"
            />
            <path
              className="hero-section__background-mist"
              d={backgroundBasePath}
              fill="url(#hero-flow-mist)"
            />
            <path
              className="hero-section__background-glow"
              d={backgroundBasePath}
              fill="url(#hero-flow-glow)"
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
