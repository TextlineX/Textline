import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

import './ProjectPage.less'

gsap.registerPlugin(TextPlugin, ScrollTrigger, MotionPathPlugin)

const works = [
  {
    id: 'chaoxingrc',
    name: 'Chaoxingrc',
    type: '跨平台客户端',
    summary: '基于 Flutter 的学习平台客户端，支持 AES-CBC 登录认证、断点续传、多平台主题定制。',
    tech: ['Flutter', 'Dart', 'AES-CBC', 'HTTP'],
    highlights: ['多平台支持', '断点续传', '主题定制'],
    image: '/images/chaocingrc.png',
    tags: ['Flutter', '移动端', '客户端'],
  },
  {
    id: 'bot-connect',
    name: 'bot_connect',
    type: '机器人控制系统',
    summary: '基于 WebSocket 的主从机器人控制系统，支持语音交互、视觉识别、ROS2 联动控制。',
    tech: ['WebSocket', 'ROS2', 'Python', 'YOLO'],
    highlights: ['主从通信', 'ASR/TTS', '视觉识别'],
    image: '/images/bot_connect.png',
    tags: ['机器人', '硬件', 'WebSocket'],
  },
  {
    id: 'ttab',
    name: 'TTab',
    type: '浏览器扩展',
    summary: '浏览器书签仪表板扩展，支持磁贴布局、词云展示、拖拽排序和国际化。',
    tech: ['React', 'TypeScript', 'Chrome Extension', 'i18n'],
    highlights: ['磁贴布局', '词云展示', '主题定制'],
    image: '/images/ttab.png',
    tags: ['浏览器扩展', 'React', '工具'],
  },
  {
    id: 'gobili-ticket',
    name: 'GoBiliTicket',
    type: '抢票工具',
    summary: '基于 Go + Gin 重构 B 站抢票流程，提供命令行与 Web 管理双入口，支持扫码登录、项目检索、抢票执行和历史管理。',
    tech: ['Go', 'Gin', 'Cobra', 'Web UI'],
    highlights: ['扫码登录', '项目检索', '轻量部署'],
    image: '/images/biliticket.png',
    tags: ['Go', '工具', '自动化'],
  },
  {
    id: 'talktalk',
    name: 'TalkTalk',
    type: '开源交流社区',
    summary: '基于 Vue 3、Ant Design Vue、Express.js 与 PostgreSQL 开发的前后端分离社区论坛，覆盖内容发布、互动和用户管理链路。',
    tech: ['Vue 3', 'Ant Design Vue', 'Express.js', 'PostgreSQL'],
    highlights: ['内容发布', '互动闭环', '线上部署'],
    image: '/images/talktalk.png',
    tags: ['Vue', '全栈', '社区'],
  },
]

// 所有标签
export const allTags = ['全部', 'Flutter', '移动端', '客户端', '机器人', '硬件', 'WebSocket', '浏览器扩展', 'React', '工具', 'Go', '自动化', 'Vue', '全栈', '社区']

// 获取所有唯一标签
export function getUniqueTags() {
  const tags = new Set<string>()
  works.forEach(work => work.tags.forEach(tag => tags.add(tag)))
  return ['全部', ...Array.from(tags)]
}

// 根据标签筛选项目
export function getWorksByTag(tag: string) {
  if (tag === '全部' || !tag) return works
  return works.filter(work => work.tags.includes(tag))
}

// 根据 ID 获取项目
export function getWorkById(id: string) {
  return works.find(work => work.id === id)
}

export function ProjectPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tag = searchParams.get('tag') || '全部'
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const filteredWorks = getWorksByTag(tag)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    gsap.set([titleBackRef.current, titleFrontRef.current].filter(Boolean), { x: 1.6, yPercent: 100 })
    gsap.set(itemRefs.current.filter(Boolean), { opacity: 0, y: 60 })

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

    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 50%',
        end: 'bottom top',
        scrub: 1,
      },
    })
    cardTl.to(itemRefs.current.filter(Boolean), { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 })

    return () => {
      titleTl.kill()
      cardTl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  const handleTagClick = (newTag: string) => {
    if (newTag === '全部') {
      setSearchParams({})
    } else {
      setSearchParams({ tag: newTag })
    }
  }

  return (
    <section ref={sectionRef} className="project-page" aria-labelledby="project-page-title">
      <div className="project-page__inner">
        <div className="project-page__title-wrap" aria-hidden="true">
          <h1 ref={titleBackRef} className="project-page__title project-page__title--back" id="project-page-title">
            PROJECTS
          </h1>
          <h1 ref={titleFrontRef} className="project-page__title project-page__title--front">
            PROJECTS
          </h1>
        </div>

        <div className="project-page__tags">
          {getUniqueTags().map((t) => (
            <button
              key={t}
              className={`project-page__tag${t === tag ? ' project-page__tag--active' : ''}`}
              onClick={() => handleTagClick(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="project-page__list">
          {filteredWorks.map((work, i) => (
            <div
              key={work.id}
              ref={(el) => { itemRefs.current[i] = el }}
              className={`project-page__item project-page__item--${i % 2 === 0 ? 'left' : 'right'}`}
            >
              <div className="project-page__item-image">
                <img src={work.image} alt={work.name} />
              </div>
              <div className="project-page__item-content">
                <div className="project-page__item-header">
                  <h2 className="project-page__item-name">{work.name}</h2>
                  <span className="project-page__item-type">{work.type}</span>
                </div>
                <p className="project-page__item-summary">{work.summary}</p>
                <div className="project-page__item-tags">
                  {work.tech.map((t) => (
                    <span key={t} className="project-page__item-tag">{t}</span>
                  ))}
                </div>
                <div className="project-page__item-highlights">
                  {work.highlights.map((h) => (
                    <span key={h} className="project-page__item-highlight">{h}</span>
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
