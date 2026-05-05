import type { PropsWithChildren } from 'react'

import { BootContext, type BootContextValue } from './BootContext'

type BootProviderProps = PropsWithChildren<BootContextValue>

export function BootProvider({ bootComplete, children }: BootProviderProps) {
  return <BootContext.Provider value={{ bootComplete }}>{children}</BootContext.Provider>
}

