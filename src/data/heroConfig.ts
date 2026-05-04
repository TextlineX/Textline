export type HeroConfig = {
  displayName: string
  introChars: number
  introDurationMs: number
  sphereRadiusRatio: number
  magneticRadiusRatio: number
  cursorDelayMs: number
  lockDelayMs: number
}

export const heroConfig: HeroConfig = {
  displayName: 'Textline',
  introChars: 8,
  introDurationMs: 2200,
  sphereRadiusRatio: 0.3,
  magneticRadiusRatio: 0.42,
  cursorDelayMs: 180,
  lockDelayMs: 220,
}
