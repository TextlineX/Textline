export type TextItem = {
  content: string
  position: 'left' | 'center' | 'right'
  fontClass?: 'hand' | 'normal'
  color?: string
}

// 预定义的彩色调色板
const colorPalette = [
  '#9b59b6', '#e91e63', '#3498db', '#2ecc71',
  '#f39c12', '#1abc9c', '#e74c3c', '#00bcd4',
  '#ff6b6b', '#4ecdc4', '#ff9ff3', '#54a0ff',
  '#5f27cd', '#ff6348', '#2ed573', '#ffa502',
]

// 获取随机颜色
export function getRandomColors(count: number): string[] {
  const shuffled = [...colorPalette].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export type SvgType = 'rings' | 'diamond' | 'wave' | 'particles'

export type TextGroup = {
  id: number
  texts: TextItem[]
  svgType: SvgType
  svgColor: string
}

export const aboutTextGroups: TextGroup[] = [
  {
    id: 1,
    texts: [
      { content: '我是Textline', position: 'center', fontClass: 'hand' },
      { content: '一个持续学习', position: 'left' },
      { content: '前端、后端、自动化', position: 'left' },
      { content: '持续创作的开发者', position: 'right' },
      { content: '3D、工具化都在做', position: 'right' },
      { content: '我做的不是单一作品', position: 'center' },
      { content: '而是可持续演化的系统', position: 'center' },
    ],
    svgType: 'rings',
    svgColor: '#9b59b6',
  },
  {
    id: 2,
    texts: [
      { content: '代码即创作', position: 'left' },
      { content: '设计即思考', position: 'left' },
      {content: '技术驱动创新', position: 'left'},
      { content: '追求极致的体验', position: 'right' },
      { content: '从构想到实现', position: 'right' },
      { content: '让想法落地', position: 'center' },
      { content: '持续进化的作品', position: 'center' },
    ],
    svgType: 'diamond',
    svgColor: '#e91e63',
  },
  {
    id: 3,
    texts: [
      { content: '全栈开发者', position: 'left' },
      { content: '创意工程师', position: 'left' },
      {content: '热爱新技术', position: 'right'},
      { content: '探索无限可能', position: 'right' },
      { content: '用代码改变世界', position: 'right' },
      { content: '构建美好未来', position: 'center' },
      { content: '永不止步', position: 'center' },
    ],
    svgType: 'wave',
    svgColor: '#3498db',
  },
]

export const svgTypes: SvgType[] = ['rings', 'diamond', 'wave', 'particles']

export const svgColors: Record<SvgType, string> = {
  rings: '#9b59b6',
  diamond: '#e91e63',
  wave: '#3498db',
  particles: '#2ecc71',
}