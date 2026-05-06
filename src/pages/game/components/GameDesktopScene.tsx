import { gameCards } from '../gameData'

type GameDesktopSceneProps = {
  activeCardIndex: number
}

function CardBox({ shortLabel, label, active }: { shortLabel: string; label: string; active: boolean }) {
  return (
    <pre
      className={active ? 'game-page__desktop-card game-page__desktop-card--active' : 'game-page__desktop-card'}
      style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}
    >{`+----------------------+
| ${shortLabel.padEnd(19, ' ')} |
|                      |
| ${label.padEnd(19, ' ')} |
+----------------------+`}</pre>
  )
}

export function GameDesktopScene({ activeCardIndex }: GameDesktopSceneProps) {
  return (
    <section className="game-page__desktop" aria-label="desktop scene">
      <div className="game-page__desktop-grid">
        {gameCards.map((card, index) => (
          <button
            key={card.id}
            type="button"
            className="game-page__desktop-card-btn"
          >
            <CardBox shortLabel={card.shortLabel} label={card.label} active={index === activeCardIndex} />
          </button>
        ))}
      </div>

      <pre className="game-page__desktop-sprite" aria-hidden="true">{`
    ^
   /|\\
  / | \\
 /  |  \\
      |
  ----v----`}</pre>
    </section>
  )
}
