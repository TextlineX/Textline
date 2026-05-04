import './TopNav.less'

type NavItem = {
  id: string
  label: string
}

type TopNavProps = {
  items: NavItem[]
}

export function TopNav({ items }: TopNavProps) {
  return (
    <header className="top-nav page-shell">
      <div className="top-nav__brand">
        <span className="top-nav__mark" aria-hidden="true" />
        <div>
          <div className="top-nav__name">Textline</div>
          <div className="top-nav__caption">Personal motion homepage</div>
        </div>
      </div>

      <nav className="top-nav__links" aria-label="Primary">
        {items.map((item) => (
          <a key={item.id} className="top-nav__link magnetic-target" href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
