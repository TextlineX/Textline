import type { Ref } from 'react'

import { buildGameUrl, type GameConfig } from '../gameConfig'

type GameEmbedFrameProps = {
  className?: string
  title?: string
  src?: string
  config?: Partial<GameConfig>
  iframeRef?: Ref<HTMLIFrameElement>
  onLoad?: () => void
}

export function GameEmbedFrame({
  className,
  title = 'Textline Game',
  src = '/game',
  config,
  iframeRef,
  onLoad,
}: GameEmbedFrameProps) {
  const url = buildGameUrl(src, {
    embed: true,
    fullscreen: true,
    showControls: false,
    simulate: true,
    ...config,
  })

  return (
    <iframe
      ref={iframeRef}
      className={className}
      title={title}
      src={url}
      allow="fullscreen; autoplay"
      allowFullScreen
      referrerPolicy="same-origin"
      onLoad={onLoad}
    />
  )
}
