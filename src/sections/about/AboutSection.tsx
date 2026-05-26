import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { aboutContentGroups, type ContentGroup } from './aboutContent'
import './AboutSection.less'

const SvgRings = ({ color }: { color: string }) => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="8" />
    <circle cx="100" cy="100" r="40" fill="none" stroke={color} strokeWidth="6" />
  </svg>
)

const SvgSpiral = ({ color }: { color: string }) => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <path
      d="M100,100 m0,-80 a80,80 0 0,1 0,160 a70,70 0 0,1 0,-140 a60,60 0 0,1 0,120 a50,50 0 0,1 0,-100 a40,40 0 0,1 0,80 a30,30 0 0,1 0,-60 a20,20 0 0,1 0,40"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
)

const SvgWave = ({ color }: { color: string }) => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <path d="M10,100 Q50,50 100,100 T190,100" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <path d="M10,120 Q50,70 100,120 T190,120" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
  </svg>
)

const SvgParticles = ({ color }: { color: string }) => (
  <svg className="about-svg" viewBox="0 0 200 200">
    <circle cx="50" cy="50" r="8" fill={color} />
    <circle cx="150" cy="50" r="6" fill={color} opacity="0.8" />
    <circle cx="100" cy="100" r="12" fill={color} />
    <circle cx="30" cy="150" r="5" fill={color} opacity="0.6" />
    <circle cx="170" cy="140" r="7" fill={color} opacity="0.7" />
    <circle cx="80" cy="170" r="4" fill={color} opacity="0.5" />
    <circle cx="140" cy="180" r="6" fill={color} opacity="0.8" />
  </svg>
)

function renderSvg(type: ContentGroup['svgType'], color: string) {
  switch (type) {
    case 'rings':
      return <SvgRings color={color} />
    case 'spiral':
      return <SvgSpiral color={color} />
    case 'wave':
      return <SvgWave color={color} />
    case 'particles':
      return <SvgParticles color={color} />
    default:
      return <SvgRings color={color} />
  }
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const groups = section.querySelectorAll('.about-group')

      groups.forEach((group) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: group,
            start: 'top 80%',
            end: 'top 20%',
            toggleActions: 'play none none reverse',
          },
        })

        const texts = group.querySelectorAll('.about-text')

        // 弹幕飞入：从右向左依次进入
        texts.forEach((text, i) => {
          gsap.set(text, { x: '120%', opacity: 0 })
          tl.to(text, { x: '0%', opacity: 1, duration: 0.6, ease: 'power3.out' }, i * 0.12)
        })

        // 弹幕滑出：全部向左滑出
        tl.to(texts, { x: '-120%', opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.05 }, '+=2')

        // SVG 动画
        const svgRing = group.querySelector('.about-svg-ring--outer')
        const svgRingInner = group.querySelector('.about-svg-ring--inner')
        if (svgRing) {
          tl.to(svgRing, { rotation: 360, duration: 2, ease: 'none', transformOrigin: 'center' }, '+=0.3')
        }
        if (svgRingInner) {
          tl.to(svgRingInner, { rotation: -360, duration: 1.5, ease: 'none', transformOrigin: 'center' }, '+=0.3')
        }
      })
    }, section)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger && section.contains(st.vars.trigger as Element)) {
          st.kill()
        }
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="about-section">
      {aboutContentGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="about-group">
          {/* SVG */}
          <div className="about-svg-canvas" aria-hidden="true">
            {renderSvg(group.svgType, group.svgColor)}
          </div>

          {/* 文字层 */}
          <div className="about-text-layer">
            {group.texts.map((text, textIndex) => (
              <div
                key={textIndex}
                className={`about-text about-text--${text.position} ${text.fontClass === 'hand' ? 'about-text--hand' : ''}`}
                style={{ top: `${20 + textIndex * 15}%` }}
              >
                {text.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}