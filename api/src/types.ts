export type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
  timestamp: number
}

export type Profile = {
  name: string
  tagline: string
  intro: string
  location: string
  links: Array<{
    label: string
    value: string
    href: string
  }>
}

export type SkillGroup = {
  title: string
  items: string[]
}

export type Project = {
  title: string
  description: string
  tags: string[]
  tech: string[]
  previewUrl: string
  sourceUrl: string
  updatedAt: string
}

export type Experience = {
  year: string
  title: string
  description: string
}
