export type GameCardId = 'profile' | 'tech' | 'projects' | 'play'

export type GameCardItem = {
  id: GameCardId
  label: string
  shortLabel: string
  title: string
  copy: string
}

export const gameCards: GameCardItem[] = [
  {
    id: 'profile',
    label: 'PROFILE',
    shortLabel: 'PROFL',
    title: '角色属性卡',
    copy: 'ID / LEVEL / HP / STATUS 这些字段以后可以直接挂你的个人信息。',
  },
  {
    id: 'tech',
    label: 'TECH STACK',
    shortLabel: 'TECH',
    title: '工具箱卡',
    copy: '这里适合放开发、设计和引擎能力，后续可以做图标浏览。',
  },
  {
    id: 'projects',
    label: 'PROJECT LOGS',
    shortLabel: 'PROJS',
    title: '项目存档卡',
    copy: '项目列表以后做成纵向滚动，像存档槽一样翻页。',
  },
  {
    id: 'play',
    label: 'INVENTORY',
    shortLabel: 'PLAY',
    title: '收藏夹卡',
    copy: '这里可以承接你的游戏、艺术、收藏等分组内容。',
  },
]
