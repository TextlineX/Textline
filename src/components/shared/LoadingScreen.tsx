import './LoadingScreen.less'

type LoadingScreenProps = {
  active: boolean
  phase?: 'loading' | 'success'
  onRevealComplete?: () => void
}

export function LoadingScreen({ active, phase = 'loading', onRevealComplete }: LoadingScreenProps) {
  return (
    <div
      className={`loading-screen${active ? ' loading-screen--active' : ''}${
        phase === 'success' ? ' loading-screen--success' : ''
      }`}
      aria-hidden="true"
    >
      {phase === 'success' ? (
        <div className="loading-screen__curtain" aria-hidden="true">
          <div className="loading-screen__mask loading-screen__mask--back" />
          <div className="loading-screen__mask loading-screen__mask--front" onAnimationEnd={onRevealComplete} />
        </div>
      ) : null}
      <div className="loading-screen__frame">
        <div className="loading-screen__title-wrap">
          <div className="loading-screen__title">TEXTLINE</div>
          <div className="loading-screen__subtitle">booting interface</div>
        </div>
        <div className="loading-screen__track">
          <div className="loading-screen__bar" />
        </div>
        <div className="loading-screen__hint">loading data / layout / effects</div>
      </div>
    </div>
  )
}
