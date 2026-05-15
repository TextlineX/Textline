import type { PropsWithChildren } from 'react'

import { BootContext, type BootContextValue } from './BootContext'

type BootProviderProps = PropsWithChildren<BootContextValue>

export function BootProvider({ bootComplete, interactiveReady, children }: BootProviderProps) {
  return <BootContext.Provider value={{ bootComplete, interactiveReady }}>{children}</BootContext.Provider>
}
