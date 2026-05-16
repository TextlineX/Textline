import './LoadingScreen.less'

type LoadingScreenProps = {
  visible: boolean
}

export function LoadingScreen({ visible }: LoadingScreenProps) {
  return (
    <div className={`loading-screen${visible ? ' loading-screen--visible' : ''}`} aria-hidden="true">
      <div className="loading-screen__mask" />
      <div className="loading-screen__panel">
        <span className="loading-screen__label">Loading</span>
      </div>
    </div>
  )
}
