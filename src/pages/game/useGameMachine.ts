import { useEffect, useState } from 'react'

import { gameCards } from './gameData'
import type { GameConfig } from './gameConfig'

export type GamePhase = 'boot' | 'desktop' | 'card'

type GameControlKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b'

type GameControlEventDetail = {
  key: GameControlKey
  pressed: boolean
}

function navigateHome() {
  window.history.pushState({}, '', '/')
  window.dispatchEvent(new PopStateEvent('popstate'))
}

type GameMachineOptions = Pick<GameConfig, 'embed' | 'simulate'>

function emitGameExit() {
  window.parent.postMessage(
    {
      type: 'textline-game-event',
      event: 'exit',
    },
    '*',
  )
}

export function useGameMachine(options: GameMachineOptions) {
  const [phase, setPhase] = useState<GamePhase>('boot')
  const [activeCardIndex, setActiveCardIndex] = useState(0)

  useEffect(() => {
    if (!options.simulate) {
      setPhase('desktop')
      return
    }

    const timerId = window.setTimeout(() => {
      setPhase('desktop')
    }, 1800)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  useEffect(() => {
    const handleControl = (event: Event) => {
      const customEvent = event as CustomEvent<GameControlEventDetail>
      const detail = customEvent.detail

      if (!detail || !detail.pressed) {
        return
      }

      if (phase === 'boot') {
        return
      }

      if (detail.key === 'left') {
        setActiveCardIndex((current) => (current - 1 + gameCards.length) % gameCards.length)
        return
      }

      if (detail.key === 'right') {
        setActiveCardIndex((current) => (current + 1) % gameCards.length)
        return
      }

      if (detail.key === 'up') {
        setPhase('desktop')
        return
      }

      if (detail.key === 'a') {
        setPhase('card')
        return
      }

      if (detail.key === 'b') {
        if (phase === 'card') {
          setPhase('desktop')
          return
        }

        if (options.embed) {
          emitGameExit()
          return
        }

        navigateHome()
      }
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as
        | {
            type?: string
            payload?: Partial<GameControlEventDetail>
          }
        | undefined

      if (!data || data.type !== 'textline-game-control' || !data.payload?.key) {
        return
      }

      handleControl(
        new CustomEvent<GameControlEventDetail>('game-control', {
          detail: {
            key: data.payload.key as GameControlKey,
            pressed: data.payload.pressed ?? true,
          },
        }),
      )
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMap: Partial<Record<string, GameControlKey>> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        z: 'a',
        x: 'b',
        Enter: 'a',
        Escape: 'b',
      }

      const key = keyMap[event.key]
      if (!key) {
        return
      }

      handleControl(
        new CustomEvent<GameControlEventDetail>('game-control', {
          detail: { key, pressed: true },
        }),
      )
      event.preventDefault()
    }

    window.addEventListener('game-control', handleControl)
    window.addEventListener('message', handleMessage)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('game-control', handleControl)
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [phase, options.embed, options.simulate])

  const activeCard = gameCards[activeCardIndex]

  return {
    activeCard,
    activeCardIndex,
    phase,
    setPhase,
  }
}
