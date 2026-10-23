import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'zh' | 'en'
export type L<T = string> = { zh: T; en: T }

type Ctx = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: <T>(value: L<T>) => T
}

const LangContext = createContext<Ctx | null>(null)

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem('tl-lang')
    if (stored === 'zh' || stored === 'en') return stored
  } catch {
    /* storage unavailable */
  }
  return /^zh/i.test(navigator.language) ? 'zh' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem('tl-lang', next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, t: (v) => v[lang] }),
    [lang, setLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}

/** Every UI string lives here, so copy can be edited in one place. */
export const ui = {
  nav: {
    work: { zh: '作品', en: 'Work' },
    about: { zh: '关于', en: 'About' },
    contact: { zh: '联系', en: 'Contact' },
  },
  skip: { zh: '跳到正文', en: 'Skip to content' },
  palette: {
    open: { zh: '打开命令面板', en: 'Open command palette' },
    label: { zh: '命令面板', en: 'Command palette' },
    placeholder: { zh: '输入作品、技术或页面…', en: 'Type a project, technology or page…' },
    pages: { zh: '页面', en: 'Pages' },
    work: { zh: '作品', en: 'Work' },
    areas: { zh: '方向', en: 'Areas' },
    tech: { zh: '技术', en: 'Technology' },
    actions: { zh: '操作', en: 'Actions' },
    home: { zh: '首页', en: 'Home' },
    github: { zh: '打开 GitHub', en: 'Open GitHub' },
    empty: {
      zh: (q: string) => `没有匹配“${q}”的结果。试试作品名或技术名，比如 React。`,
      en: (q: string) => `Nothing matches “${q}”. Try a project or technology, such as React.`,
    },
    hintMove: { zh: '选择', en: 'select' },
    hintOpen: { zh: '打开', en: 'open' },
    hintClose: { zh: '关闭', en: 'close' },
  },
  switchLang: { zh: 'Switch to English', en: '切换为中文' },
  switchLangShort: { zh: 'EN', en: '中' },
  themeToLight: { zh: '切换为浅色模式', en: 'Switch to light mode' },
  themeToDark: { zh: '切换为深色模式', en: 'Switch to dark mode' },
  hero: {
    tagline: {
      zh: '我是 Textline，全栈开发者。做客户端、后端、机器人和小工具，从界面一路做到服务端。',
      en: "I'm Textline, a full-stack developer. I build clients, backends, robots and small tools, from the interface down to the server.",
    },
    label: { zh: 'Parse the unknown. Render the feature.', en: 'Parse the unknown. Render the feature.' },
  },
  work: {
    title: { zh: '作品', en: 'Work' },
    intro: {
      zh: '从手机客户端到机器人控制，这是我做过的几个项目。',
      en: 'A few projects I have built, from mobile clients to robot control.',
    },
  },
  about: {
    lead: {
      zh: '我写能跑起来的东西：客户端、浏览器扩展、机器人控制、后端服务。',
      en: 'I build things that run: mobile clients, browser extensions, robot control and backend services.',
    },
    body: {
      zh: '一个项目我会从界面做到服务端，必要时连硬件也一起接上。最近在学 Three.js 和 3D 可视化，也习惯把重复的事情做成工具。',
      en: 'I take a project from the interface down to the server, and wire up the hardware when it needs it. Lately I am learning Three.js and 3D visualisation, and I like turning repetitive tasks into tools.',
    },
    stack: [
      { name: { zh: '界面', en: 'Interface' }, items: ['React', 'TypeScript', 'Vue 3', 'Flutter', 'Three.js'] },
      { name: { zh: '服务端', en: 'Server' }, items: ['Node.js', 'Express', 'Go', 'Gin', 'PostgreSQL'] },
      { name: { zh: '机器人与自动化', en: 'Robotics and automation' }, items: ['Python', 'ROS2', 'WebSocket', 'YOLO'] },
    ],
  },
  contact: {
    title: { zh: '联系我', en: 'Get in touch' },
    intro: {
      zh: '项目合作，或者只是打个招呼，都可以发邮件。',
      en: 'For a project, a collaboration or just to say hello, send an email.',
    },
    copy: { zh: '复制邮箱', en: 'Copy email' },
    copied: { zh: '已复制', en: 'Copied' },
    github: { zh: 'GitHub 主页', en: 'GitHub profile' },
  },
  home: {
    allWork: { zh: '查看全部作品', en: 'See all work' },
    moreAbout: { zh: '更多关于我', en: 'More about me' },
  },
  index: {
    title: { zh: '全部作品', en: 'All work' },
    lead: { zh: '按方向或技术筛选，点开任意一个看细节。', en: 'Filter by area or technology, then open any project for details.' },
    count: { zh: (n: number) => `${n} 个项目`, en: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}` },
    all: { zh: '全部', en: 'All' },
    area: { zh: '方向', en: 'Area' },
    tech: { zh: '技术', en: 'Technology' },
    view: { zh: '显示方式', en: 'View' },
    list: { zh: '列表', en: 'List' },
    grid: { zh: '网格', en: 'Grid' },
    empty: { zh: '没有同时符合这两个条件的项目。', en: 'No project matches both filters.' },
    clear: { zh: '清除筛选', en: 'Clear filters' },
  },
  aboutPage: {
    title: { zh: '关于', en: 'About' },
    areasTitle: { zh: '我做的方向', en: 'What I work on' },
    matrixTitle: { zh: '技术 × 项目', en: 'Technology × project' },
    matrixLead: {
      zh: '每一行是一项技术，每一列是一个项目。点技术名，查看用到它的作品。',
      en: 'Each row is a technology, each column a project. Select a technology to see the work that uses it.',
    },
    projects: { zh: (n: number) => `${n} 个项目`, en: (n: number) => `${n} ${n === 1 ? 'project' : 'projects'}` },
  },
  notFound: {
    body: {
      zh: '这个地址没有内容。可能是链接打错了，或者页面已经移走。',
      en: 'Nothing lives at this address. The link may be mistyped, or the page has moved.',
    },
    home: { zh: '回到首页', en: 'Back to home' },
    work: { zh: '浏览作品', en: 'Browse work' },
  },
  workPage: {
    area: { zh: '方向', en: 'Area' },
    back: { zh: '全部作品', en: 'All work' },
    highlights: { zh: '亮点', en: 'Highlights' },
    stack: { zh: '技术栈', en: 'Stack' },
    next: { zh: '下一个作品', en: 'Next project' },
    prev: { zh: '上一个', en: 'Previous' },
    pager: { zh: '作品翻页', en: 'Project navigation' },
    notFound: { zh: '没有找到这个作品。', en: 'This project does not exist.' },
  },
} satisfies Record<string, unknown>

export const EMAIL = 'textlinex@qq.com'
export const GITHUB = 'https://github.com/TextlineX?tab=repositories'
