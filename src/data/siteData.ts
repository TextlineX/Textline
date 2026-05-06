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

export type PlaygroundProject = {
  title: string
  description: string
  stack: string[]
  status: string
  year: string
  tag: string
}

export const playgroundProjects: PlaygroundProject[] = [
  {
    title: 'Textline',
    description: '3D 叙事主页，负责承载滚动状态机和舞台级动效。',
    stack: ['React', 'TypeScript', 'Three.js'],
    status: 'LIVE',
    year: '2026',
    tag: 'Homepage',
  },
  {
    title: 'Portfolio Lab',
    description: '个人作品展示系统，用于验证视觉表达和模块复用。',
    stack: ['Vite', 'Less', 'Canvas'],
    status: 'BUILD',
    year: '2026',
    tag: 'Visual',
  },
  {
    title: 'Realtime Feed',
    description: '面向动态内容的 mock 数据展示入口，后续可切真实 API。',
    stack: ['Express', 'JSON', 'API'],
    status: 'PLAN',
    year: '2026',
    tag: 'Backend',
  },
  {
    title: 'Motion Sandbox',
    description: '测试物理交互、磁吸反馈和节奏型动画的小型实验场。',
    stack: ['anime.js', 'Matter.js', 'SVG'],
    status: 'PROTOTYPE',
    year: '2025',
    tag: 'Motion',
  },
  {
    title: 'Works Tunnel',
    description: '用隧道式结构组织项目卡片与切换模式的展示实验。',
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
