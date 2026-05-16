import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import { useScrollScope } from '../../hooks/scroll'
import './WorksSection.less'

const works = [
  {
    id: 'chaoxingrc',
    name: 'Chaoxingrc',
    type: '跨平台客户端',
    summary: '基于 Flutter 的学习平台客户端，支持 AES-CBC 登录认证、断点续传、多平台主题定制。',
    tech: ['Flutter', 'Dart', 'AES-CBC', 'HTTP'],
    highlights: ['多平台支持', '断点续传', '主题定制'],
  },
  {
    id: 'bot-connect',
    name: 'bot_connect',
    type: '机器人控制系统',
    summary: '基于 WebSocket 的主从机器人控制系统，支持语音交互、视觉识别、ROS2 联动控制。',
    tech: ['WebSocket', 'ROS2', 'Python', 'YOLO'],
    highlights: ['主从通信', 'ASR/TTS', '视觉识别'],
  },
  {
    id: 'ttab',
    name: 'TTab',
    type: '浏览器扩展',
    summary: '浏览器书签仪表板扩展，支持磁贴布局、词云展示、拖拽排序和国际化。',
    tech: ['React', 'TypeScript', 'Chrome Extension', 'i18n'],
    highlights: ['磁贴布局', '词云展示', '主题定制'],
  },
]

export function WorksSection() {
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const { ref } = useScrollScope({
    id: 'home-works',
    enabled: true,
    touchEnabled: true,
    sensitivity: 0.0025,
    damping: 0.12,
    clamp: [0, 1] as [number, number],
    activationRatio: 0.2,
    onProgress: () => {},
  })

  useEffect(() => {
    const targets = [titleBackRef.current, titleFrontRef.current]
    targets.forEach((el) => {
      if (el) gsap.set(el, { y: 80, opacity: 0 })
    })

    const tl = gsap.timeline()
    tl.to(titleBackRef.current, { y: 0, opacity: 1, duration: 0.72 }, 0)
    tl.to(titleFrontRef.current, { y: 0, opacity: 1, duration: 0.72 }, 0.04)

    itemRefs.current.forEach((item) => {
      if (item) gsap.set(item, { opacity: 0, y: 60 })
    })
    const tl2 = gsap.timeline()
    tl2.to(itemRefs.current.filter(Boolean), { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 })

    return () => { tl.kill(); tl2.kill() }
  }, [])

  return (
    <section ref={ref} className="works-section" aria-labelledby="works-section-title">
      <div className="works-section__inner">
        <div className="works-section__title-wrap" aria-hidden="true">
          <h1 ref={titleBackRef} className="works-section__title works-section__title--back" id="works-section-title">
            WORKS
          </h1>
          <h1 ref={titleFrontRef} className="works-section__title works-section__title--front">
            WORKS
          </h1>
        </div>

        <div className="works-section__list">
          {works.map((work, i) => (
            <div
              key={work.id}
              ref={(el) => { itemRefs.current[i] = el }}
              className={`works-item works-item--${i % 2 === 0 ? 'left' : 'right'}`}
            >
              <div className="works-item__image">
                <div className="works-item__placeholder">{work.name}</div>
              </div>
              <div className="works-item__content">
                <div className="works-item__header">
                  <h2 className="works-item__name">{work.name}</h2>
                  <span className="works-item__type">{work.type}</span>
                </div>
                <p className="works-item__summary">{work.summary}</p>
                <div className="works-item__tags">
                  {work.tech.map((t) => (
                    <span key={t} className="works-item__tag">{t}</span>
                  ))}
                </div>
                <div className="works-item__highlights">
                  {work.highlights.map((h) => (
                    <span key={h} className="works-item__highlight">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}