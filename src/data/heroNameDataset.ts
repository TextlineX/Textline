export const heroNameDataset = [
  'A',
  'C',
  'E',
  'I',
  'L',
  'N',
  'T',
  'X',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '7',
] as const

export type HeroNameDatasetItem = (typeof heroNameDataset)[number]
