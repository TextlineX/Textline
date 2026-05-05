import type { ReactNode } from 'react'

import { AppShellScrollContext, type AppShellScrollContextValue } from './AppShellScrollContext'

type AppShellScrollProviderProps = {
  value: AppShellScrollContextValue
  children: ReactNode
}

export function AppShellScrollProvider({ value, children }: AppShellScrollProviderProps) {
  return <AppShellScrollContext.Provider value={value}>{children}</AppShellScrollContext.Provider>
}
