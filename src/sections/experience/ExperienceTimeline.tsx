import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'

import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'

import './ExperienceTimeline.less'

type ExperienceTimelineProps = {
  sectionIndex: number
}

type TimelineEntry = {
  year: string
  title: string
  description: string
  tags: string[]
}

const svgWidth = 1400
const svgHeight = 920

const timelineEntries: TimelineEntry[] = [
  {
    year: '2022',
    title: 'Engineering foundation',
    description: '建立前端工程化、组件拆分和类型约束的开发习惯。',
    tags: ['TypeScript', 'Components'],
  },
  {
    year: '2023',
    title: 'Automation experiments',
    description: '开始用 Python 和脚本流把重复流程抽成可复用工具。',
    tags: ['Python', 'Automation'],
  },
  {
    year: '2024',
    title: 'Motion system build-up',
    description: '系统积累 Canvas、Three.js、交互动效与页面状态编排经验。',
    tags: ['Canvas', 'Three.js'],
  },
  {
    year: '2025',
    title: 'Chaoxing AI pipeline',
    description: '把 OCR、自动回填和流程控制串成完整的实战项目通道。',
    tags: ['Go', 'OCR', 'RPA'],
  },
  {
    year: '2026',
    title: 'Textline narrative system',
    description: '把个人主页做成具备物理、滚动状态机与 3D 叙事的作品系统。',
    tags: ['Motion', 'State', '3D'],
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function wrap01(value: number) {
  const wrapped = value % 1
  return wrapped < 0 ? wrapped + 1 : wrapped
}

export function ExperienceTimeline({ sectionIndex }: ExperienceTimelineProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const pathRef = useRef<SVGPathElement | null>(null)
  const turbulenceRef = useRef<SVGFETurbulenceElement | null>(null)
  const displacementRef = useRef<SVGFEDisplacementMapElement | null>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const nodeRefs = useRef<Array<SVGCircleElement | null>>([])
  const tetherRefs = useRef<Array<SVGLineElement | null>>([])
  const progressRef = useRef(0)
  const engagedRef = useRef(false)
  const pointerRef = useRef({ x: 0.5, y: 0.5, energy: 0 })
  const { scrollOffset, viewportHeight, activeIndex } = useAppShellScroll()

  const sectionStart = sectionIndex * viewportHeight
  const sectionProgress = viewportHeight <= 0 ? 0 : clamp((scrollOffset - sectionStart) / viewportHeight, 0, 1)

  const isEngaged = activeIndex === sectionIndex

  const pathD = useMemo(() => {
    return 'M 112 742 C 214 152 374 120 526 400 S 758 844 914 486 S 1188 124 1288 704'
  }, [])

  useEffect(() => {
    progressRef.current = sectionProgress
  }, [sectionProgress])

  useEffect(() => {
    engagedRef.current = isEngaged
  }, [isEngaged])

  useLayoutEffect(() => {
    gsap.registerPlugin(MotionPathPlugin)

    const root = rootRef.current
    const path = pathRef.current

    if (!root || !path) {
      return
    }

    const rawPath = MotionPathPlugin.getRawPath(path.getAttribute('d') ?? '')
    let frameId = 0

    const tick = () => {
      const rect = root.getBoundingClientRect()
      const scaleX = rect.width / svgWidth
      const scaleY = rect.height / svgHeight
      const progress = progressRef.current
      const pointer = pointerRef.current
      const engagedFactor = engagedRef.current ? 1 : 0.45
      const warpScale = 8 + progress * 24 + pointer.energy * 18 * engagedFactor
      const noiseX = 0.0048 + pointer.x * 0.0032
      const noiseY = 0.012 + pointer.y * 0.0075

      turbulenceRef.current?.setAttribute('baseFrequency', `${noiseX.toFixed(4)} ${noiseY.toFixed(4)}`)
      displacementRef.current?.setAttribute('scale', warpScale.toFixed(2))

      timelineEntries.forEach((_, index) => {
        const node = nodeRefs.current[index]
        const card = cardRefs.current[index]
        const tether = tetherRefs.current[index]

        if (!node || !card || !tether) {
          return
        }

        const baseProgress = 0.08 + index * 0.18
        const walkingProgress = wrap01(baseProgress + progress * 0.46 + Math.sin(progress * 6.2 + index * 0.8) * 0.02)
        const position = MotionPathPlugin.getPositionOnPath(rawPath, walkingProgress, true) as {
          angle?: number
          x: number
          y: number
        }

        const angleDeg = position.angle ?? 0
        const angleRad = (angleDeg * Math.PI) / 180
        const normalRad = angleRad + Math.PI / 2
        const offsetDistance = (index % 2 === 0 ? 1 : -1) * (94 + Math.sin(progress * 5 + index) * 18)
        const nodeX = position.x * scaleX
        const nodeY = position.y * scaleY
        const cardX = (position.x + Math.cos(normalRad) * offsetDistance) * scaleX
        const cardY = (position.y + Math.sin(normalRad) * offsetDistance) * scaleY
        const reveal = clamp(progress * 1.26 - index * 0.09 + 0.38, 0, 1)

        gsap.set(node, {
          attr: {
            cx: nodeX,
            cy: nodeY,
            r: 7 + reveal * 5,
          },
          opacity: 0.24 + reveal * 0.76,
        })

        gsap.set(tether, {
          attr: {
            x1: nodeX,
            y1: nodeY,
            x2: cardX,
            y2: cardY,
          },
          opacity: 0.12 + reveal * 0.44,
        })

        gsap.set(card, {
          x: cardX,
          y: cardY,
          rotation: clamp((angleDeg - 90) * 0.08, -8, 8),
          opacity: reveal,
          filter: `blur(${(1 - reveal) * 12}px)`,
          scale: 0.9 + reveal * 0.1,
        })
      })

      pointerRef.current.energy *= 0.92
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect()
      const nextX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const nextY = clamp((event.clientY - rect.top) / rect.height, 0, 1)

      pointerRef.current.x = nextX
      pointerRef.current.y = nextY
      pointerRef.current.energy = clamp(pointerRef.current.energy + 0.18, 0, 1)

      root.style.setProperty('--experience-pointer-x', `${(nextX * 100).toFixed(2)}%`)
      root.style.setProperty('--experience-pointer-y', `${(nextY * 100).toFixed(2)}%`)
    }

    const handlePointerLeave = () => {
      pointerRef.current.x = 0.5
      pointerRef.current.y = 0.5
      root.style.setProperty('--experience-pointer-x', '50%')
      root.style.setProperty('--experience-pointer-y', '50%')
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className={`experience-timeline${isEngaged ? ' experience-timeline--engaged' : ''}`}>
      <svg className="experience-timeline__svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id="experience-timeline-warp" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence ref={turbulenceRef} type="fractalNoise" baseFrequency="0.006 0.016" numOctaves="2" seed="8" />
            <feDisplacementMap ref={displacementRef} in="SourceGraphic" scale="0" />
          </filter>

          <linearGradient id="experience-timeline-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(241, 106, 106, 0.18)" />
            <stop offset="52%" stopColor="rgba(255, 255, 255, 0.66)" />
            <stop offset="100%" stopColor="rgba(101, 196, 200, 0.24)" />
          </linearGradient>
        </defs>

        <g filter="url(#experience-timeline-warp)">
          <path className="experience-timeline__rail-shadow" d={pathD} />
          <path ref={pathRef} className="experience-timeline__rail" d={pathD} />

          {timelineEntries.map((entry, index) => (
            <line
              key={`${entry.year}-tether`}
              ref={(node) => {
                tetherRefs.current[index] = node
              }}
              className="experience-timeline__tether"
              x1="0"
              y1="0"
              x2="0"
              y2="0"
            />
          ))}

          {timelineEntries.map((entry, index) => (
            <circle
              key={`${entry.year}-node`}
              ref={(node) => {
                nodeRefs.current[index] = node
              }}
              className="experience-timeline__node"
              cx="0"
              cy="0"
              r="0"
            />
          ))}
        </g>
      </svg>

      <div className="experience-timeline__cards" aria-hidden="true">
        {timelineEntries.map((entry, index) => (
          <article
            key={entry.year}
            ref={(node) => {
              cardRefs.current[index] = node
            }}
            className="experience-timeline__card"
          >
            <div className="experience-timeline__card-year">{entry.year}</div>
            <div className="experience-timeline__card-title">{entry.title}</div>
            <p className="experience-timeline__card-copy">{entry.description}</p>
            <div className="experience-timeline__card-tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="experience-timeline__tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="experience-timeline__noise" />
    </div>
  )
}
