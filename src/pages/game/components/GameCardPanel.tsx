import type { GameCardItem } from '../gameData'

type GameCardPanelProps = {
  card: GameCardItem
  active: boolean
}

export function GameCardPanel({ card, active }: GameCardPanelProps) {
  return (
    <section
      className={['game-page__card-panel', active ? 'game-page__card-panel--active' : '']
        .filter(Boolean)
        .join(' ')}
      aria-label={card.label}
    >
      <p className="game-page__card-panel-kicker">{card.label}</p>
      <h2 className="game-page__card-panel-title">{card.title}</h2>
      <p className="game-page__card-panel-copy">{card.copy}</p>
      <p className="game-page__card-panel-foot">[B] TO CLOSE</p>
    </section>
  )
}
