export type SectionBridgePhaseConfig = {
  overlapVh: number
  liftVh: number
  opacityFrom: number
  opacityTo: number
}

export type SectionBridgeConfig = {
  prev?: string
  next?: string
  enter?: Partial<SectionBridgePhaseConfig>
  exit?: Partial<SectionBridgePhaseConfig>
}

export const sectionBridgeConfigById: Record<string, SectionBridgeConfig> = {
  hero: {
    next: 'about',
    exit: {
      overlapVh: 0.3,
      liftVh: 0.92,
      opacityFrom: 1,
      opacityTo: 0,
    },
  },
  about: {
    prev: 'hero',
    next: 'skills',
    enter: {
      overlapVh: 0.2,
      liftVh: 0.68,
      opacityFrom: 0.72,
      opacityTo: 1,
    },
    exit: {
      overlapVh: 0.28,
      liftVh: 0.88,
      opacityFrom: 1,
      opacityTo: 0.08,
    },
  },
  skills: {
    prev: 'about',
    next: 'works',
    enter: {
      overlapVh: 0.18,
      liftVh: 0.58,
      opacityFrom: 0.78,
      opacityTo: 1,
    },
    exit: {
      overlapVh: 0.24,
      liftVh: 0.82,
      opacityFrom: 1,
      opacityTo: 0.12,
    },
  },
  works: {
    prev: 'skills',
    next: 'experience',
    enter: {
      overlapVh: 0.18,
      liftVh: 0.56,
      opacityFrom: 0.8,
      opacityTo: 1,
    },
    exit: {
      overlapVh: 0.24,
      liftVh: 0.8,
      opacityFrom: 1,
      opacityTo: 0.1,
    },
  },
  experience: {
    prev: 'works',
    next: 'playground',
    enter: {
      overlapVh: 0.16,
      liftVh: 0.5,
      opacityFrom: 0.82,
      opacityTo: 1,
    },
    exit: {
      overlapVh: 0.22,
      liftVh: 0.78,
      opacityFrom: 1,
      opacityTo: 0.12,
    },
  },
  playground: {
    prev: 'experience',
    next: 'contact',
    enter: {
      overlapVh: 0.16,
      liftVh: 0.48,
      opacityFrom: 0.82,
      opacityTo: 1,
    },
    exit: {
      overlapVh: 0.2,
      liftVh: 0.74,
      opacityFrom: 1,
      opacityTo: 0.16,
    },
  },
  contact: {
    prev: 'playground',
    enter: {
      overlapVh: 0.12,
      liftVh: 0.38,
      opacityFrom: 0.88,
      opacityTo: 1,
    },
  },
}
