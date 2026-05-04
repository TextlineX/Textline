import './LoadingScreen.less'

type LoadingScreenProps = {
  active: boolean
}

export function LoadingScreen({ active }: LoadingScreenProps) {
  return (
    <div className={`loading-screen${active ? ' loading-screen--active' : ''}`} aria-hidden="true">
      <div className="loading-screen__frame">
        <div className="loading-screen__title">TEXTLINE</div>
        <div className="loading-screen__subtitle">booting interface</div>
        <div className="loading-screen__track">
          <div className="loading-screen__bar" />
        </div>
        <div className="loading-screen__hint">loading data / layout / effects</div>
      </div>
    </div>
  )
}
