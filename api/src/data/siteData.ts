import type { Experience, Profile, Project, SkillGroup } from '../types.js'

export const profile: Profile = {
  name: 'Textline',
  tagline: 'Super personalized interactive homepage',
  intro:
    '这是个人主页的 API 数据源，当前先用本地数据返回，后续可接入真实平台数据。',
  location: 'China',
  links: [
    {
      label: 'GitHub',
      value: 'github.com/you',
      href: 'https://github.com/you',
    },
    {
      label: 'Email',
      value: 'hello@yourmail.com',
      href: 'mailto:hello@yourmail.com',
    },
    {
      label: 'Bilibili',
      value: 'space.bilibili.com/you',
      href: 'https://space.bilibili.com/you',
    },
  ],
}

export const skills: SkillGroup[] = [
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Less'],
  },
  {
    title: 'Motion',
    items: ['three.js', 'matter.js', 'anime.js', 'Canvas', 'SVG'],
  },
  {
    title: 'Engineering',
    items: ['API Design', 'Component System', 'State Modeling', 'Tooling'],
  },
]

export const projects: Project[] = [
  {
    title: 'Portfolio Lab',
    description: '个人主页视觉实验场，承载高个性化的动效和信息展示。',
    tags: ['homepage', 'motion'],
    tech: ['React', 'TypeScript', 'Less'],
    previewUrl: 'https://example.com/portfolio-lab',
    sourceUrl: 'https://github.com/you/portfolio-lab',
    updatedAt: '2026-05-04T00:00:00.000Z',
  },
  {
    title: 'Realtime Feed',
    description: '后续用于承接公共平台作品数据的动态展示模块。',
    tags: ['api', 'feed'],
    tech: ['Express', 'TypeScript'],
    previewUrl: 'https://example.com/realtime-feed',
    sourceUrl: 'https://github.com/you/realtime-feed',
    updatedAt: '2026-05-04T00:00:00.000Z',
  },
  {
    title: 'Motion Sandbox',
    description: '用于测试粒子、物理交互和动画编排的小型实验项目。',
    tags: ['playground', 'canvas'],
    tech: ['matter.js', 'anime.js'],
    previewUrl: 'https://example.com/motion-sandbox',
    sourceUrl: 'https://github.com/you/motion-sandbox',
    updatedAt: '2026-05-04T00:00:00.000Z',
  },
]

export const experience: Experience[] = [
  {
    year: '2026',
    title: 'Homepage system design',
    description: '先完成信息架构、组件拆分和 API 数据通道。',
  },
  {
    year: '2025',
    title: 'Motion exploration',
    description: '持续积累 three.js、matter.js 和复杂动画编排经验。',
  },
  {
    year: '2024',
    title: 'Frontend foundation',
    description: '建立工程化、组件化和类型化开发习惯。',
  },
]
