import './FloatingBar.less'

export function FloatingBar() {
  return (
    <div className="floating-bar" aria-label="Site navigation">
      <a className="floating-bar__brand" href="/" aria-label="Textline home">
        <div className="floating-bar__brand_logo" aria-hidden="true" />
        Textline
      </a>
      <div className="floating-bar__actions">
        <button className="floating-bar__menu" type="button" aria-label="Open menu">
          <span className="floating-bar__menu-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="floating-bar__menu-text">MENU</span>
        </button>
        <a className="floating-bar__contact" href="#contact">
          CONTACT
        </a>
      </div>
    </div>
  )
}
