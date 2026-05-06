import { createContext, useContext } from 'react'

export type AppShellScrollContextValue = {
  scrollOffset: number
  scrollProgress: number
  viewportHeight: number
  maxOffset: number
  activeIndex: number
  playgroundRevealProgress: number
  scrollPhysicsReady: boolean
  scrollPhysicsPulseId: number
  scrollPhysicsDirection: number
  scrollPhysicsStrength: number
}

export const AppShellScrollContext = createContext<AppShellScrollContextValue | null>(null)

export function useAppShellScroll() {
  const context = useContext(AppShellScrollContext)

  if (!context) {
    throw new Error('useAppShellScroll must be used within AppShellScrollProvider')
  }

  return context
}
