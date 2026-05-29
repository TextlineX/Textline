import {useLayoutEffect, useRef, useState} from 'react'
import gsap from 'gsap'
import {MorphSVGPlugin} from 'gsap/MorphSVGPlugin'

import {aboutTextGroups, getRandomColors, type SvgType} from '../../data/aboutData'
import './AboutSection.less'

gsap.registerPlugin(MorphSVGPlugin)

// 各 SVG 路径定义（需要点数一致才能正确变形）
const shapePaths: Record<SvgType, { outer: string; inner: string }> = {
    rings: {
        outer: 'M100,20 A80,80 0 1,1 99.99,20 Z',
        inner: 'M100,60 A40,40 0 1,1 99.99,60 Z',
    },
    diamond: {
        outer: 'M32,8 L56,20 L56,44 L32,56 L8,44 L8,20 Z',
        inner: 'M56,20 L32,32 L8,20 M32,32 L32,56',
    },
    wave: {
        outer: 'M10,100 Q55,50 100,100 T190,100',
        inner: 'M10,120 Q55,70 100,120 T190,120',
    },
    particles: {
        outer: 'M50,50 L150,50 L100,100 L30,150 L170,140 L80,170 L140,180 L50,50 Z',
        inner: 'M50,50 L50,50 L50,50 L50,50 L50,50 L50,50 L50,50 L50,50 Z',
    },
}

// 代码 SVG 组件
const CodeSvg = ({color, id}: { color: string; id: number }) => (
    <svg className="about-svg" viewBox="0 0 220 220">
        <defs>
            <linearGradient id={`codeGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color}/>
                <stop offset="100%" stopColor={color} stopOpacity="0.5"/>
            </linearGradient>
        </defs>
        <text
            x="110"
            y="115"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="100"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="700"
            fill={`url(#codeGrad-${id})`}
        >
            {'</>'}
        </text>
  </svg>
)

// 普通变形 SVG 组件
const MorphSvg = ({type, color, id}: { type: SvgType; color: string; id: number }) => {
    const viewBox = type === 'diamond' ? '0 0 64 64' : '0 0 200 200'
    const strokeWidth = type === 'diamond' ? 2.5 : 6
    const innerStrokeWidth = type === 'diamond' ? 2 : 4

    return (
        <svg className="about-svg" viewBox={viewBox}>
            <defs>
                <linearGradient id={`morphGrad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color}/>
                    <stop offset="100%" stopColor={color} stopOpacity="0.4"/>
                </linearGradient>
            </defs>
            <g>
                <path
                    className="morph-outer"
                    d={shapePaths[type].outer}
                    fill="none"
                    stroke={`url(#morphGrad-${id})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                />
                <path
                    className="morph-inner"
                    d={shapePaths[type].inner}
                    fill="none"
                    stroke={`url(#morphGrad-${id})`}
                    strokeWidth={innerStrokeWidth}
                    strokeLinecap="round"
                    opacity="0.7"
                />
            </g>
        </svg>
    )
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textLayerRef = useRef<HTMLDivElement>(null)
  const svgLayerRef = useRef<HTMLDivElement>(null)
  const [randomColors] = useState(() => aboutTextGroups.map((group) => getRandomColors(group.texts.length)))

  useLayoutEffect(() => {
    const section = sectionRef.current
    const textLayer = textLayerRef.current
    const svgLayer = svgLayerRef.current

    if (!section || !textLayer || !svgLayer) return

    const ctx = gsap.context(() => {
      const textGroups = gsap.utils.toArray<HTMLElement>('.about-text-group')
      const svgEls = gsap.utils.toArray<HTMLElement>('.about-svg-canvas')
        const outerPaths = gsap.utils.toArray<SVGPathElement>('.morph-outer')
        const innerPaths = gsap.utils.toArray<SVGPathElement>('.morph-inner')
      const groupCount = Math.min(textGroups.length, svgEls.length)

        // 初始状态
      gsap.set(textGroups, { autoAlpha: 0 })
      gsap.set('.about-text', { x: '120%', opacity: 0 })
      gsap.set(svgEls, { opacity: 0, scale: 0.8 })
        gsap.set(outerPaths, {scale: 0.8, transformOrigin: '100px 100px'})
        gsap.set(innerPaths, {scale: 0.8, transformOrigin: '100px 100px'})

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
          const outerPath = outerPaths[i]
          const innerPath = innerPaths[i]
        const groupLabel = `about-group-${i}`

          // 淡入
        tl.set(textGroup, { autoAlpha: 1 }, groupLabel)
          tl.to(svgEl, {opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out'}, groupLabel)

          // 如果是普通变形 SVG，应用缩放动画
          if (outerPath && innerPath) {
              tl.to([outerPath, innerPath], {scale: 1, duration: 0.3, ease: 'back.out(1.7)'}, groupLabel)
          }

          // 文字入场
          tl.to(
              textEls,
              {
                  x: '0%',
                  opacity: 1,
                  duration: 0.5,
                  ease: 'power3.out',
                  stagger: 0.08,
              },
              '>-0.1'
          )

          // 停留
          tl.to({}, {duration: 0.3})

          // 文字出场
          tl.to(
              textEls,
              {
                  x: '-120%',
                  opacity: 0,
                  duration: 0.4,
                  ease: 'power2.in',
              }
          )

          // SVG 淡出
          tl.to(svgEl, {opacity: 0, scale: 0.8, duration: 0.2}, '>-0.2')
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
                {group.svgType === 'rings' ? (
                    <CodeSvg color={group.svgColor} id={group.id}/>
                ) : (
                    <MorphSvg type={group.svgType} color={group.svgColor} id={group.id}/>
                )}
            </div>
          ))}
        </div>

        <div ref={textLayerRef} className="about-text-layer">
            {aboutTextGroups.map((group, groupIndex) => (
            <div key={group.id} className="about-text-group">
              {group.texts.map((text, i) => (
                <div
                  key={`${group.id}-${i}`}
                  className={`about-text about-text--${text.position} ${text.fontClass === 'hand' ? 'about-text--hand' : ''}`}
                  style={{
                      top: `${25 + i * 10}%`,
                      color: text.color || randomColors[groupIndex][i],
                  }}
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
