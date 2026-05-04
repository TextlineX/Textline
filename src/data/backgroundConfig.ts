export type BackgroundMaskPreset = 'circle' | 'scan' | 'window' | 'path' | 'glitch' | 'fade'

export type BackgroundMaskFrame = {
  width: string
  height: string
  top: string
  left: string
  shadowOpacity: number
}

export type BackgroundSectionConfig = {
  id: string
  segment: number
  maskPreset: BackgroundMaskPreset
  intensity: number
  maskFrame?: BackgroundMaskFrame
}

export const backgroundSections: BackgroundSectionConfig[] = [
  {
    id: 'hero',
    segment: 0,
    maskPreset: 'circle',
    intensity: 1,
    maskFrame: {
      width: 'min(88vw, 72rem)',
      height: 'min(76vh, 54rem)',
      top: '48%',
      left: '50%',
      shadowOpacity: 0.14,
    },
  },
  {
    id: 'about',
    segment: 1,
    maskPreset: 'circle',
    intensity: 0.75,
    maskFrame: {
      width: 'min(74vw, 56rem)',
      height: 'min(60vh, 42rem)',
      top: '48%',
      left: '50%',
      shadowOpacity: 0.18,
    },
  },
  { id: 'skills', segment: 2, maskPreset: 'scan', intensity: 0.82 },
  { id: 'works', segment: 3, maskPreset: 'window', intensity: 0.78 },
  { id: 'experience', segment: 4, maskPreset: 'path', intensity: 0.76 },
  { id: 'playground', segment: 5, maskPreset: 'glitch', intensity: 0.92 },
  { id: 'contact', segment: 6, maskPreset: 'fade', intensity: 0.68 },
]

export const backgroundPlayback = {
  totalDuration: 70,
  segments: backgroundSections.length,
}
