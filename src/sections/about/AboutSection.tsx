import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

import { aboutTextGroups, type SvgType } from '../../data/aboutData'
import './AboutSection.less'

const SvgRings = () => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <circle className="about-svg-ring about-svg-ring--outer" cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="8" />
    <circle className="about-svg-ring about-svg-ring--inner" cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="6" />
  </svg>
)

const SvgSpiral = () => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <path
      d="M100,100 m0,-80 a80,80 0 0,1 0,160 a70,70 0 0,1 0,-140 a60,60 0 0,1 0,120 a50,50 0 0,1 0,-100 a40,40 0 0,1 0,80 a30,30 0 0,1 0,-60 a20,20 0 0,1 0,40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

const SvgWave = () => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <path d="M10,100 Q50,50 100,100 T190,100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="M10,120 Q50,70 100,120 T190,120" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
)

const SvgParticles = () => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <circle cx="50" cy="50" r="8" fill="currentColor" />
    <circle cx="150" cy="50" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="100" cy="100" r="12" fill="currentColor" />
    <circle cx="30" cy="150" r="5" fill="currentColor" opacity="0.6" />
    <circle cx="170" cy="140" r="7" fill="currentColor" opacity="0.7" />
    <circle cx="80" cy="170" r="4" fill="currentColor" opacity="0.5" />
    <circle cx="140" cy="180" r="6" fill="currentColor" opacity="0.8" />
  </svg>
)

function renderSvg(type: SvgType) {
  switch (type) {
    case 'rings':
      return <SvgRings />
    case 'spiral':
      return <SvgSpiral />
    case 'wave':
      return <SvgWave />
    case 'particles':
      return <SvgParticles />
  }
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const svgLayerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const textLayer = textLayerRef.current
    const svgLayer = svgLayerRef.current

    if (!section || !textLayer || !svgLayer) return

    const ctx = gsap.context(() => {
      const textGroups = gsap.utils.toArray<HTMLElement>('.about-text-group')
      const svgEls = gsap.utils.toArray<HTMLElement>('.about-svg-canvas')
      const groupCount = Math.min(textGroups.length, svgEls.length)

      // 初始：所有组常驻 DOM，但隐藏在入场前状态，避免 scrub 中途重渲染替换节点。
      gsap.set(textGroups, { autoAlpha: 0 })
      gsap.set('.about-text', { x: '120%', opacity: 0 })
      gsap.set(svgEls, { opacity: 0, scale: 0.8 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom top',
          scrub: 1,
        },
      })

      for (let i = 0; i < groupCount; i++) {
        const textGroup = textGroups[i]
        const textEls = textGroup.querySelectorAll('.about-text')
        const svgEl = svgEls[i]
        const groupLabel = `about-group-${i}`

        tl.set(textGroup, { autoAlpha: 1 }, groupLabel)
        tl.to(svgEl, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, groupLabel)
        tl.to(textEls, {
          x: '0%',
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
        }, groupLabel)

        // 等待停留
        tl.to({}, { duration: 0.5 })

        tl.to(textEls, {
          x: '-120%',
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        })

        tl.to(svgEl, { opacity: 0, scale: 0.8, duration: 0.3 }, '+=0')
        tl.set(textGroup, { autoAlpha: 0 })
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="about-section">
      <div className="about-group">
        <div ref={svgLayerRef} className="about-svg-layer">
          {aboutTextGroups.map((group) => (
            <div key={group.id} className="about-svg-canvas" style={{ color: group.svgColor }}>
              {renderSvg(group.svgType)}
            </div>
          ))}
        </div>

        <div ref={textLayerRef} className="about-text-layer">
          {aboutTextGroups.map((group) => (
            <div key={group.id} className="about-text-group">
              {group.texts.map((text, i) => (
                <div
                  key={`${group.id}-${i}`}
                  className={`about-text about-text--${text.position} ${text.fontClass === 'hand' ? 'about-text--hand' : ''}`}
                  style={{ top: `${25 + i * 10}%` }}
                >
                  {text.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
