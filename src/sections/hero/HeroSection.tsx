import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react'
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
  const backgroundFrameRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const wordShellRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordActiveRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [introComplete, setIntroComplete] = useState(false)

  useLayoutEffect(() => {
    const visual = visualRef.current
    const backgroundFrame = backgroundFrameRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
    const wordActiveNodes = wordActiveRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!visual || !backgroundFrame || !title) return

    gsap.set(visual, { height: '47.95%' })
    gsap.set(backgroundFrame, { opacity: 0, yPercent: 0 })
    gsap.set(title, { opacity: 0, y: 18 })
    gsap.set(wordShellNodes, { opacity: 0, y: 24 })
    gsap.set(wordActiveNodes, { clipPath: 'inset(100% 0 0 0)' })
  }, [])

  useLayoutEffect(() => {
    const visual = visualRef.current
    const backgroundFrame = backgroundFrameRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!visual || !backgroundFrame || !title || !introReady || introComplete) return

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
      .to(backgroundFrame, { opacity: 1, duration: 0.45 }, 0)
      .to(title, { opacity: 1, y: 0, duration: 0.35 }, 0)
      .to(wordShellNodes, { opacity: 1, y: 0, stagger: 0.06, duration: 0.62 }, 0.08)

    return () => {
      introTimeline.kill()
    }
  }, [introReady, introComplete])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const visual = visualRef.current
    const backgroundFrame = backgroundFrameRef.current
    const title = titleRef.current
    const wordShellNodes = wordShellRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))
    const wordActiveNodes = wordActiveRefs.current.filter((el): el is HTMLSpanElement => Boolean(el))

    if (!section || !visual || !backgroundFrame || !title || wordShellNodes.length === 0 || wordActiveNodes.length === 0) return

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
        .fromTo(backgroundFrame, { yPercent: 0 }, { yPercent: -10, ease: 'none' }, 0)
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
            className="hero-section__mask-defs"
            aria-hidden="true"
            focusable="false"
            width="0"
            height="0"
            viewBox="0 0 1440 900"
          >
            <defs>
              <clipPath id="hero-liquid-mask" clipPathUnits="userSpaceOnUse">
                <path d={backgroundBasePath} />
              </clipPath>
            </defs>
          </svg>
          <div
            ref={backgroundFrameRef}
            className="hero-section__background"
            aria-hidden="true"
            style={
              {
                '--hero-base-1': gradientPalette.base1,
                '--hero-base-2': gradientPalette.base2,
                '--hero-base-3': gradientPalette.base3,
                '--hero-base-4': gradientPalette.base4,
                '--hero-pink': gradientPalette.pink,
              } as CSSProperties
            }
          >
            <span className="hero-section__background-layer hero-section__background-layer--base" />
            <span className="hero-section__background-layer hero-section__background-layer--mist" />
            <span className="hero-section__background-layer hero-section__background-layer--glow" />
          </div>
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
