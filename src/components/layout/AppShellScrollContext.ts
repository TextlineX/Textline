import { createContext, useContext } from 'react'

export type AppShellScrollContextValue = {
  scrollOffset: number
  scrollProgress: number
  viewportHeight: number
  sectionStep: number
  maxOffset: number
  activeIndex: number
  playgroundRevealProgress: number
  experienceRevealProgress: number
  worksRevealProgress: number
  worksScrollImpulse: number
  scrollPhysicsReady: boolean
  scrollPhysicsPulseId: number
  scrollPhysicsDirection: number
  scrollPhysicsStrength: number
  scrollDirection: 1 | -1
  requestHome: () => void
}

export const AppShellScrollContext = createContext<AppShellScrollContextValue | null>(null)

export function useAppShellScroll(): AppShellScrollContextValue {
  const context = useContext(AppShellScrollContext)

  if (!context) {
    throw new Error('useAppShellScroll must be used within AppShellScrollProvider')
  }

  return context
}
