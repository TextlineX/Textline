import type { L } from '../i18n'

export type CategoryId = 'interface' | 'server' | 'automation' | 'hardware'

export const categories: { id: CategoryId; name: L; note: L }[] = [
  { id: 'interface', name: { zh: '界面', en: 'Interface' }, note: { zh: '网页、客户端、浏览器扩展', en: 'Web, apps and browser extensions' } },
  { id: 'server', name: { zh: '服务端', en: 'Server' }, note: { zh: 'API、数据库、部署', en: 'APIs, databases and deployment' } },
  { id: 'automation', name: { zh: '自动化', en: 'Automation' }, note: { zh: '把重复的事交给程序', en: 'Handing repetitive work to programs' } },
  { id: 'hardware', name: { zh: '硬件', en: 'Hardware' }, note: { zh: '机器人与设备联动', en: 'Robots and connected devices' } },
]

export type Work = {
  id: string
  categories: CategoryId[]
  name: string
  type: L
  summary: L
  highlights: L<string[]>
  tech: string[]
  image: string
  /** Intrinsic image size, so the browser can reserve space before it loads. */
  size: [number, number]
  /** Portrait screenshots are letterboxed instead of cropped. */
  portrait?: boolean
}

export const works: Work[] = [
  {
    id: 'chaoxingrc',
    categories: ['interface'],
    name: 'Chaoxingrc',
    type: { zh: '跨平台客户端', en: 'Cross-platform client' },
    summary: {
      zh: '基于 Flutter 的学习平台客户端，支持 AES-CBC 登录认证、断点续传、多平台主题定制。',
      en: 'A Flutter client for a learning platform, with AES-CBC login, resumable downloads and per-platform theming.',
    },
    highlights: {
      zh: ['多平台支持', '断点续传', '主题定制'],
      en: ['Multi-platform', 'Resumable downloads', 'Theming'],
    },
    tech: ['Flutter', 'Dart', 'AES-CBC', 'HTTP'],
    image: '/images/chaoxingrc.webp',
    size: [720, 1600],
    portrait: true,
  },
  {
    id: 'bot-connect',
    categories: ['hardware', 'automation'],
    name: 'bot_connect',
    type: { zh: '机器人控制系统', en: 'Robot control system' },
    summary: {
      zh: '基于 WebSocket 的主从机器人控制系统，支持语音交互、视觉识别、ROS2 联动控制。',
      en: 'A WebSocket master/slave robot control system with voice interaction, computer vision and ROS2 integration.',
    },
    highlights: {
      zh: ['主从通信', 'ASR / TTS', '视觉识别'],
      en: ['Master–slave link', 'ASR / TTS', 'Vision'],
    },
    tech: ['WebSocket', 'ROS2', 'Python', 'YOLO'],
    image: '/images/bot-connect.webp',
    size: [1600, 881],
  },
  {
    id: 'ttab',
    categories: ['interface'],
    name: 'TTab',
    type: { zh: '浏览器扩展', en: 'Browser extension' },
    summary: {
      zh: '浏览器书签仪表板扩展，支持磁贴布局、词云展示、拖拽排序和国际化。',
      en: 'A bookmark dashboard extension with tile layout, word cloud, drag-and-drop sorting and i18n.',
    },
    highlights: {
      zh: ['磁贴布局', '词云展示', '主题定制'],
      en: ['Tile layout', 'Word cloud', 'Theming'],
    },
    tech: ['React', 'TypeScript', 'Chrome Extension', 'i18n'],
    image: '/images/ttab.webp',
    size: [1600, 881],
  },
  {
    id: 'gobili-ticket',
    categories: ['server', 'automation'],
    name: 'GoBiliTicket',
    type: { zh: '抢票工具', en: 'Ticketing tool' },
    summary: {
      zh: '基于 Go + Gin 重构 B 站抢票流程，提供命令行与 Web 管理双入口，支持扫码登录、项目检索、抢票执行和历史管理。',
      en: 'A Go + Gin rewrite of the Bilibili ticket flow, with a CLI and a web admin: QR login, event search, ticket runs and history.',
    },
    highlights: {
      zh: ['扫码登录', '项目检索', '轻量部署'],
      en: ['QR login', 'Event search', 'Light deployment'],
    },
    tech: ['Go', 'Gin', 'Cobra', 'Web UI'],
    image: '/images/gobili-ticket.webp',
    size: [1600, 881],
  },
  {
    id: 'talktalk',
    categories: ['interface', 'server'],
    name: 'TalkTalk',
    type: { zh: '开源交流社区', en: 'Open-source forum' },
    summary: {
      zh: '基于 Vue 3、Ant Design Vue、Express.js 与 PostgreSQL 开发的前后端分离社区论坛，覆盖内容发布、互动和用户管理链路。',
      en: 'A decoupled community forum built with Vue 3, Ant Design Vue, Express.js and PostgreSQL, covering posting, interaction and user management.',
    },
    highlights: {
      zh: ['内容发布', '互动闭环', '线上部署'],
      en: ['Posting', 'Interaction loop', 'Live deployment'],
    },
    tech: ['Vue 3', 'Ant Design Vue', 'Express.js', 'PostgreSQL'],
    image: '/images/talktalk.webp',
    size: [1600, 888],
  },
]

/** Every technology across the projects, in project order, with the projects that use it. */
export const techIndex: { tech: string; works: Work[] }[] = (() => {
  const map = new Map<string, Work[]>()
  for (const work of works) {
    for (const tech of work.tech) map.set(tech, [...(map.get(tech) ?? []), work])
  }
  return [...map.entries()]
    .map(([tech, list]) => ({ tech, works: list }))
})()
