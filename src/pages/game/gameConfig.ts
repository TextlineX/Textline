export type GameConfig = {
  embed: boolean
  fullscreen: boolean
  simulate: boolean
  showControls: boolean
}

export type GameConfigMessage = {
  type: 'textline-game-config'
  payload: Partial<GameConfig>
}

export type GameControlKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b'

export type GameControlMessage = {
  type: 'textline-game-control'
  payload: {
    key: GameControlKey
    pressed?: boolean
  }
}

function readFlag(value: string | null, fallback: boolean) {
  if (value === null) {
    return fallback
  }

  if (value === '1' || value === 'true' || value === 'yes' || value === 'on') {
    return true
  }

  if (value === '0' || value === 'false' || value === 'no' || value === 'off') {
    return false
  }

  return fallback
}

export function buildGameUrl(pathname = '/game', config: Partial<GameConfig> = {}) {
  const url = new URL(pathname, window.location.origin)
  const params = url.searchParams

  if (typeof config.embed === 'boolean') {
    params.set('embed', config.embed ? '1' : '0')
  }

  if (typeof config.fullscreen === 'boolean') {
    params.set('fullscreen', config.fullscreen ? '1' : '0')
  }

  if (typeof config.simulate === 'boolean') {
    params.set('simulate', config.simulate ? '1' : '0')
  }

  if (typeof config.showControls === 'boolean') {
    params.set('controls', config.showControls ? '1' : '0')
  }

  return `${url.pathname}${url.search}${url.hash}`
}

export function postGameConfigMessage(targetWindow: Window, payload: Partial<GameConfig>, targetOrigin = '*') {
  targetWindow.postMessage(
    {
      type: 'textline-game-config',
      payload,
    },
    targetOrigin,
  )
}

export function postGameControlMessage(
  targetWindow: Window,
  key: GameControlKey,
  pressed = true,
  targetOrigin = '*',
) {
  targetWindow.postMessage(
    {
      type: 'textline-game-control',
      payload: {
        key,
        pressed,
      },
    },
    targetOrigin,
  )
}

export function readGameConfig(search: string = window.location.search): GameConfig {
  const params = new URLSearchParams(search)
  const embed = readFlag(params.get('embed'), false)
  const fullscreen = readFlag(params.get('fullscreen'), true)
  const simulate = readFlag(params.get('simulate'), true)
  const showControls = readFlag(params.get('controls'), !embed)

  return {
    embed,
    fullscreen,
    simulate,
    showControls,
  }
}
