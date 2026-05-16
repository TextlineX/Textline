export type HeroWord = {
  id: string
  label: string
  colorClass: string
  weightClass: string
  fontSize: number
  lineHeight: number
  letterSpacing: string
}

export const heroWords = [
  {
    id: 'parse',
    label: 'PARSE',
    colorClass: 'hero-section__word--dark',
    weightClass: 'hero-section__word--bold',
    fontSize: 200,
    lineHeight: 136,
    letterSpacing: '0.05em',
  },
  {
    id: 'the-a',
    label: 'THE',
    colorClass: 'hero-section__word--dark',
    weightClass: 'hero-section__word--regular',
    fontSize: 160,
    lineHeight: 104,
    letterSpacing: '0.03em',
  },
  {
    id: 'unknown',
    label: 'UNKNOWN',
    colorClass: 'hero-section__word--dark',
    weightClass: 'hero-section__word--regular',
    fontSize: 180,
    lineHeight: 106,
    letterSpacing: '0.035em',
  },
  {
    id: 'render',
    label: 'RENDER',
    colorClass: 'hero-section__word--light',
    weightClass: 'hero-section__word--bold',
    fontSize: 180,
    lineHeight: 172,
    letterSpacing: '0.035em',
  },
  {
    id: 'the-b',
    label: 'THE',
    colorClass: 'hero-section__word--dark',
    weightClass: 'hero-section__word--regular',
    fontSize: 160,
    lineHeight: 104,
    letterSpacing: '0.008em',
  },
  {
    id: 'feature',
    label: 'FEATURE',
    colorClass: 'hero-section__word--dark',
    weightClass: 'hero-section__word--bold',
    fontSize: 220,
    lineHeight: 136,
    letterSpacing: '0.05em',
  },
] as const satisfies readonly HeroWord[]

export const heroWordRows = [
  [heroWords[0], heroWords[1], heroWords[2]],
  [heroWords[3], heroWords[4], heroWords[5]],
] as const
