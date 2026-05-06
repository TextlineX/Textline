type GameBootScreenProps = {
  active: boolean
}

export function GameBootScreen({ active }: GameBootScreenProps) {
  if (!active) {
    return null
  }

  return (
    <section className="game-page__boot" aria-label="boot screen">
      <p className="game-page__boot-title">LOADING...</p>
      <div className="game-page__boot-icon" aria-hidden="true">
        <span />
      </div>
      <div className="game-page__boot-bar" aria-hidden="true">
        <span />
      </div>
    </section>
  )
}
