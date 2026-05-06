import { useEffect, useState } from 'react'

import { readGameConfig, type GameConfig, type GameConfigMessage } from './gameConfig'

export function useGameConfig() {
  const [config, setConfig] = useState<GameConfig>(() => readGameConfig())

  useEffect(() => {
    const handlePopState = () => {
      setConfig(readGameConfig())
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as Partial<GameConfig> | GameConfigMessage | undefined
      if (!data || typeof data !== 'object') {
        return
      }

      if ('type' in data && data.type === 'textline-game-config') {
        setConfig((current) => ({
          ...current,
          ...data.payload,
        }))
        return
      }

      setConfig((current) => ({
        ...current,
        ...data,
      }))
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return config
}
