import { useGameConfig } from './useGameConfig'
import { GameCanvasScene } from './components/GameCanvasScene'
import { GameVirtualControls } from './components/GameVirtualControls'
import { useGameMachine } from './useGameMachine'
import './GamePage.less'

export function GamePage() {
  const config = useGameConfig()
  const { activeCard, activeCardIndex, phase } = useGameMachine({
    embed: config.embed,
    simulate: config.simulate,
  })
  const rootClassName = [
    'game-page',
    config.embed ? 'game-page--embed' : null,
    config.fullscreen ? 'game-page--fullscreen' : null,
    config.showControls ? 'game-page--controls' : 'game-page--controls-hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className={rootClassName}>
      {config.embed ? <div className="game-page__embed-shell" aria-hidden="true" /> : null}
      <div className="game-page__stage" aria-hidden="true">
        <GameCanvasScene
          phase={phase}
          activeCardIndex={activeCardIndex}
          activeCard={activeCard}
          className="game-page__canvas"
        />
      </div>

      <GameVirtualControls visible={config.showControls} />
    </main>
  )
}
