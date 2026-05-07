export const navItems = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'works', label: 'Works' },
  { id: 'experience', label: 'Experience' },
  { id: 'playground', label: 'Playground' },
  { id: 'contact', label: 'Contact' },
]

export const heroTags = [
  'Creative Frontend',
  'Motion Systems',
  'Interactive Storytelling',
]

export const skillGroups = [
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Less'],
  },
  {
    title: 'Motion',
    items: ['anime.js', 'Matter.js', 'Three.js', 'Canvas', 'SVG'],
  },
  {
    title: 'Engineering',
    items: ['API Design', 'State Modeling', 'Component Systems', 'Tooling'],
  },
]

export const workCards = [
  {
    title: 'Portfolio Lab',
    description: '用于承载强视觉和实验性效果的个人主页作品。',
    status: 'Designing',
  },
  {
    title: 'Realtime Feed',
    description: '后续接入 API 后展示来自公共平台的动态作品数据。',
    status: 'Planned',
  },
  {
    title: 'Motion Sandbox',
    description: '用于测试物理交互、粒子和页面动效编排。',
    status: 'Prototype',
  },
]

function escapeSvgText(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&apos;'
      default:
        return character
    }
  })
}

function buildProjectCover(options: {
  title: string
  year: string
  tag: string
  topColor: string
  bottomColor: string
  glowColor: string
  lineColor: string
}) {
  const initials = options.title
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img" aria-label="${escapeSvgText(options.title)} cover">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${options.topColor}" />
          <stop offset="100%" stop-color="${options.bottomColor}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="42%" r="72%">
          <stop offset="0%" stop-color="${options.glowColor}" stop-opacity="0.92" />
          <stop offset="58%" stop-color="${options.glowColor}" stop-opacity="0.18" />
          <stop offset="100%" stop-color="${options.glowColor}" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${options.lineColor}" stop-opacity="0.12" />
          <stop offset="100%" stop-color="${options.lineColor}" stop-opacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="960" height="640" fill="url(#bg)" />
      <rect width="960" height="640" fill="url(#glow)" />
      <g fill="none" stroke="url(#stroke)" stroke-width="2">
        <path d="M40 120H920" />
        <path d="M72 220H888" />
        <path d="M108 320H852" />
        <path d="M132 420H828" />
        <path d="M172 520H788" />
        <path d="M120 84V556" />
        <path d="M260 56V584" />
        <path d="M420 38V602" />
        <path d="M580 28V612" />
        <path d="M740 56V584" />
        <path d="M864 88V552" />
      </g>
      <g opacity="0.9">
        <circle cx="756" cy="132" r="118" fill="${options.glowColor}" fill-opacity="0.14" />
        <circle cx="756" cy="132" r="68" fill="${options.glowColor}" fill-opacity="0.22" />
        <circle cx="756" cy="132" r="16" fill="${options.glowColor}" fill-opacity="0.6" />
      </g>
      <text x="480" y="120" text-anchor="middle" fill="${options.lineColor}" fill-opacity="0.88" font-family="Inter, Arial, sans-serif" font-size="28" letter-spacing="0.32em">${escapeSvgText(options.tag.toUpperCase())}</text>
      <text x="480" y="382" text-anchor="middle" fill="#f5f7fa" fill-opacity="0.96" font-family="Inter, Arial, sans-serif" font-size="164" font-weight="700" letter-spacing="0.04em">${escapeSvgText(initials)}</text>
      <text x="480" y="482" text-anchor="middle" fill="#dcefff" fill-opacity="0.92" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="600">${escapeSvgText(options.title)}</text>
      <text x="480" y="560" text-anchor="middle" fill="${options.lineColor}" fill-opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="30" letter-spacing="0.22em">${escapeSvgText(options.year)}</text>
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export type PlaygroundProject = {
  title: string
  description: string
  image: string
  stack: string[]
  status: string
  year: string
  tag: string
}

export const playgroundProjects: PlaygroundProject[] = [
  {
    title: 'Textline',
    description: '3D 叙事主页，负责承载滚动状态机和舞台级动效。',
    image: buildProjectCover({
      title: 'Textline',
      year: '2026',
      tag: 'Homepage',
      topColor: '#111b2f',
      bottomColor: '#07111c',
      glowColor: '#a8e6ff',
      lineColor: '#dff8ff',
    }),
    stack: ['React', 'TypeScript', 'Three.js'],
    status: 'LIVE',
    year: '2026',
    tag: 'Homepage',
  },
  {
    title: 'Portfolio Lab',
    description: '个人作品展示系统，用于验证视觉表达和模块复用。',
    image: buildProjectCover({
      title: 'Portfolio Lab',
      year: '2026',
      tag: 'Visual',
      topColor: '#1a1830',
      bottomColor: '#08101b',
      glowColor: '#ffb9d0',
      lineColor: '#ffddea',
    }),
    stack: ['Vite', 'Less', 'Canvas'],
    status: 'BUILD',
    year: '2026',
    tag: 'Visual',
  },
  {
    title: 'Realtime Feed',
    description: '面向动态内容的 mock 数据展示入口，后续可切真实 API。',
    image: buildProjectCover({
      title: 'Realtime Feed',
      year: '2026',
      tag: 'Backend',
      topColor: '#10253a',
      bottomColor: '#061017',
      glowColor: '#8ed6ff',
      lineColor: '#c8ebff',
    }),
    stack: ['Express', 'JSON', 'API'],
    status: 'PLAN',
    year: '2026',
    tag: 'Backend',
  },
  {
    title: 'Motion Sandbox',
    description: '测试物理交互、磁吸反馈和节奏型动画的小型实验场。',
    image: buildProjectCover({
      title: 'Motion Sandbox',
      year: '2025',
      tag: 'Motion',
      topColor: '#15263b',
      bottomColor: '#07121b',
      glowColor: '#8df0df',
      lineColor: '#d0fff7',
    }),
    stack: ['anime.js', 'Matter.js', 'SVG'],
    status: 'PROTOTYPE',
    year: '2025',
    tag: 'Motion',
  },
  {
    title: 'Works Tunnel',
    description: '用隧道式结构组织项目卡片与切换模式的展示实验。',
    image: buildProjectCover({
      title: 'Works Tunnel',
      year: '2025',
      tag: 'Mode',
      topColor: '#1d2035',
      bottomColor: '#08111a',
      glowColor: '#ffc9a8',
      lineColor: '#ffe7cf',
    }),
    stack: ['React', 'UI State', 'Transitions'],
    status: 'SYNC',
    year: '2025',
    tag: 'Mode',
  },
]

export const experienceItems = [
  {
    year: '2026',
    title: 'Homepage system design',
    description: '先完成信息架构、组件拆分和动态内容通道。',
  },
  {
    year: '2025',
    title: 'Motion and visual exploration',
    description: '持续积累 three.js、matter.js 和动画系统经验。',
  },
  {
    year: '2024',
    title: 'Frontend foundation',
    description: '建立工程化、组件化和类型化的开发习惯。',
  },
]

export const contactLinks = [
  { label: 'GitHub', value: 'github.com/you' },
  { label: 'Email', value: 'hello@yourmail.com' },
  { label: 'Bilibili', value: 'space.bilibili.com/you' },
]
