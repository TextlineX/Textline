import { gameCards } from '../gameData'

type GameDesktopSceneProps = {
  activeCardIndex: number
}

export function GameDesktopScene({ activeCardIndex }: GameDesktopSceneProps) {
  return (
    <section className="game-page__desktop" aria-label="desktop scene">
      <div className="game-page__desktop-grid">
        {gameCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className={[
              'game-page__desktop-card',
              index === activeCardIndex ? 'game-page__desktop-card--active' : null,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="game-page__desktop-card-badge">{card.shortLabel}</span>
            <span className="game-page__desktop-card-title">{card.label}</span>
          </button>
        ))}
      </div>

      <div className="game-page__desktop-sprite" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
