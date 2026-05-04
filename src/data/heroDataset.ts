export const heroDataset = [
  'TEXTLINE',
  'REACT',
  'ARIS',
  'MIKA',
  'VUE',
  'TYPESCRIPT',
  'AI',
  'ENOA',
  'KEI',
  'PLANA',
  'ARONA',
  'PYTHON',
  'AXIOS',
  'BLENDER',
  'UNITY',
] as const

export type HeroDatasetItem = (typeof heroDataset)[number]
