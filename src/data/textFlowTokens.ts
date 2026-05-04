export const textFlowTokens = [
  '0_',
  'f+',
  '-}',
  '01',
  'f)',
  'V*',
  '!~',
  '&%',
  'gT',
  'fg',
  '>M',
  'sd',
  'ms',
  '+_',
  '白',
  '|"',
] as const

export type TextFlowToken = (typeof textFlowTokens)[number]
