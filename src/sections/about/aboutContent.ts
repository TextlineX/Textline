export type TextItem = {
  content: string
  position: 'left' | 'center' | 'right'
  fontClass?: 'hand' | 'normal'
}

export type SvgType = 'rings' | 'spiral' | 'wave' | 'particles'

export type ContentGroup = {
  texts: TextItem[]
  svgType: SvgType
  svgColor: string
}

export const aboutContentGroups: ContentGroup[] = [
  {
    texts: [
      { content: '我是Textline', position: 'center', fontClass: 'hand' },
      { content: '一个持续学习、', position: 'left' },
      { content: '前端、后端、自动化、', position: 'left' },
    ],
    svgType: 'rings',
    svgColor: '#9b59b6',
  },
  {
    texts: [
      { content: '持续创作的开发者', position: 'right' },
      { content: '3D、工具化都在做', position: 'right' },
    ],
    svgType: 'spiral',
    svgColor: '#e91e63',
  },
  {
    texts: [
      { content: '我做的不是单一作品', position: 'center' },
      { content: '而是可持续演化的系统', position: 'center' },
    ],
    svgType: 'wave',
    svgColor: '#3498db',
  },
]
