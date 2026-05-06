type GameControlKey = 'up' | 'down' | 'left' | 'right' | 'a' | 'b'

type GameVirtualControlsProps = {
  visible: boolean
}

function emitGameControl(key: GameControlKey, pressed: boolean) {
  window.dispatchEvent(
    new CustomEvent('game-control', {
      detail: {
        key,
        pressed,
      },
    }),
  )
}

export function GameVirtualControls({ visible }: GameVirtualControlsProps) {
  if (!visible) {
    return null
  }

  return (
    <div className="game-page__controls" aria-label="virtual controls">
      <div className="game-page__dpad">
        <button
          className="game-page__control game-page__control--up"
          type="button"
          aria-label="上"
          onPointerDown={() => emitGameControl('up', true)}
          onPointerUp={() => emitGameControl('up', false)}
          onPointerLeave={() => emitGameControl('up', false)}
        >
          ↑
        </button>
        <button
          className="game-page__control game-page__control--left"
          type="button"
          aria-label="左"
          onPointerDown={() => emitGameControl('left', true)}
          onPointerUp={() => emitGameControl('left', false)}
          onPointerLeave={() => emitGameControl('left', false)}
        >
          ←
        </button>
        <button
          className="game-page__control game-page__control--down"
          type="button"
          aria-label="下"
          onPointerDown={() => emitGameControl('down', true)}
          onPointerUp={() => emitGameControl('down', false)}
          onPointerLeave={() => emitGameControl('down', false)}
        >
          ↓
        </button>
        <button
          className="game-page__control game-page__control--right"
          type="button"
          aria-label="右"
          onPointerDown={() => emitGameControl('right', true)}
          onPointerUp={() => emitGameControl('right', false)}
          onPointerLeave={() => emitGameControl('right', false)}
        >
          →
        </button>
      </div>

      <div className="game-page__action-pair">
        <button
          className="game-page__control game-page__control--action game-page__control--a"
          type="button"
          aria-label="A"
          onPointerDown={() => emitGameControl('a', true)}
          onPointerUp={() => emitGameControl('a', false)}
          onPointerLeave={() => emitGameControl('a', false)}
        >
          A
        </button>
        <button
          className="game-page__control game-page__control--action game-page__control--b"
          type="button"
          aria-label="B"
          onPointerDown={() => emitGameControl('b', true)}
          onPointerUp={() => emitGameControl('b', false)}
          onPointerLeave={() => emitGameControl('b', false)}
        >
          B
        </button>
      </div>
    </div>
  )
}
