import { createContext, useContext } from 'react'

type BootContextValue = {
  bootComplete: boolean
}

const BootContext = createContext<BootContextValue | null>(null)

export function useBootContext() {
  const context = useContext(BootContext)

  if (!context) {
    throw new Error('useBootContext must be used within BootProvider')
  }

  return context
}

export { BootContext }
export type { BootContextValue }

