import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import './WorksSection.less'

gsap.registerPlugin(TextPlugin, ScrollTrigger, MotionPathPlugin)

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
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const nameRefs = useRef<(HTMLHeadingElement | null)[]>([])
  const summaryRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const wavePathRef = useRef<SVGPathElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return


    gsap.set([titleBackRef.current, titleFrontRef.current].filter(Boolean), { x: 1.6, yPercent: 100 })
    gsap.set(itemRefs.current.filter(Boolean), { opacity: 0, y: 60 })


    // 标题入场动画（scrub 模式）
    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'bottom top',
        scrub: 1.5,
      },
    })

    titleTl
      .to(titleBackRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0)
      .to(titleFrontRef.current, { x: 1.6, yPercent: 0, duration: 0.72 }, 0.04)

    // 卡片入场动画
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom top',
        scrub: 1,
      },
    })
    cardTl.to(itemRefs.current.filter(Boolean), { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 })

    // 项目名称逐字动画
    works.forEach((work, i) => {
      const nameEl = nameRefs.current[i]
      const itemEl = itemRefs.current[i]

      if (nameEl) nameEl.textContent = ''
      if (summaryRefs.current[i]) summaryRefs.current[i].textContent = ''

      if (nameEl && itemEl) {
        gsap.to(nameEl, {
          text: { value: work.name, delimiter: '' },
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: itemEl,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      // 项目描述逐字动画（稍后触发）
      if (summaryRefs.current[i] && itemEl) {
        gsap.to(summaryRefs.current[i], {
          text: { value: work.summary, delimiter: '' },
          duration: 1,
          ease: 'power2.out',
          delay: 0.3,
          scrollTrigger: {
            trigger: itemEl,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    })

    // 每个作品卡片滚动视差
    itemRefs.current.forEach((item, i) => {
      if (!item) return

      const direction = i % 2 === 0 ? 1 : -1
      const imageEl = item.querySelector('.works-item__image')
      const contentEl = item.querySelector('.works-item__content')

      // 图片视差
      gsap.fromTo(
        imageEl,
        { y: 0 },
        {
          y: direction * -60,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      )

      // 内容视差
      gsap.fromTo(
        contentEl,
        { y: direction * 40 },
        {
          y: direction * -40,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      )

      // 卡片进入时缩放
      gsap.fromTo(
        item,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            end: 'bottom top',
            scrub: 1,
          },
        }
      )
    })

    // 标题淡出
    gsap.to([titleBackRef.current, titleFrontRef.current].filter(Boolean), {
      yPercent: -50,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'center top',
        end: 'bottom top',
        scrub: 1,
      },
    })

    //SVG延伸

    interface Point {
      x: number
      y: number
    }
// 获取每个项目中心位置
    const points:Point[] = itemRefs.current
        .filter((el): el is HTMLDivElement => el !== null)
        .map((el) => {
          const imageEl = el.querySelector('.works-item__image')
          if (!imageEl) return { x: 0, y: 0 }

          const rect = imageEl.getBoundingClientRect()
          const sectionRect = section.getBoundingClientRect()
          return {
            x: rect.left - sectionRect.left + rect.width / 2,
            y: rect.top - sectionRect.top + rect.height / 2
          }
        })


  // 设置 SVG viewBox 为 section 的尺寸

// 生成平滑曲线 SVG path
    function generateSmoothPath(points: Point[]): string {
      if (points.length === 0) return ''
      if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

      let d = `M -100 ${points[0].y}`

      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i]
        const next = points[i + 1]
        const cpX = (curr.x + next.x) / 2
        const cpY = (curr.y + next.y) / 2
        d += ` Q ${curr.x} ${curr.y} ${cpX} ${cpY}`
      }

      const last = points[points.length - 1]
      d += ` L ${last.x} ${last.y} L 1500 ${last.y}`  // 延伸到右边

      return d
    }



// 设置 path
    if (wavePathRef.current && points.length > 0) {
      const pathD = generateSmoothPath(points)
      if (!pathD) return

      wavePathRef.current.setAttribute('d', pathD)
      const pathLength = wavePathRef.current.getTotalLength()
      if (pathLength === 0) return

      wavePathRef.current.style.strokeDasharray = pathLength + 'px'
      wavePathRef.current.style.strokeDashoffset = pathLength + 'px'

      gsap.to(wavePathRef.current, {
        strokeDashoffset: '0px',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1,
        }
      })

      gsap.to(wavePathRef.current, {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse'
        }
      })
    }

    return () => {
      titleTl.kill()
      cardTl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="works-section" aria-labelledby="works-section-title">
      <div className="works-section__inner">
        <svg
          className="works-wave"
          viewBox="0 0 1200 1200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="worksGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="30%" stopColor="#4ecdc4" />
              <stop offset="50%" stopColor="#ff6b6b" />
              <stop offset="70%" stopColor="#4ecdc4" />
              <stop offset="100%" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
          <path ref={wavePathRef} stroke="url(#worksGradient)" strokeWidth="4" fill="none" />
        </svg>

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
                  <h2 ref={(el) => { nameRefs.current[i] = el }} className="works-item__name">{work.name}</h2>
                  <span className="works-item__type">{work.type}</span>
                </div>
                <p ref={(el) => { summaryRefs.current[i] = el }} className="works-item__summary">{work.summary}</p>
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
