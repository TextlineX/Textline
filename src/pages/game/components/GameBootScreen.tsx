type GameBootScreenProps = {
  active: boolean
}

export function GameBootScreen({ active }: GameBootScreenProps) {
  if (!active) {
    return null
  }

  return (
    <section className="game-page__boot" aria-label="boot screen">
      <pre className="game-page__boot-ascii" aria-hidden="true">{`
  +----------------------------+
  |      ABOUT SCREEN         |
  |       LOADING...          |
  |           |               |
  |        [####]             |
  +----------------------------+
      `}</pre>
    </section>
  )
}
