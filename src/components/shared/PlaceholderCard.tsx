import './PlaceholderCard.less'

type PlaceholderCardProps = {
  title: string
  subtitle: string
  lines?: number
  magnetic?: boolean
}

export function PlaceholderCard({
  title,
  subtitle,
  lines = 2,
  magnetic = false,
}: PlaceholderCardProps) {
  return (
    <div className={`placeholder-card surface${magnetic ? ' magnetic-target' : ''}`} data-magnetic-shell="wide">
      <div className="surface__inner placeholder-card__inner">
        <div className="placeholder-card__meta">
          <span className="chip">{title}</span>
          <span className="muted">{subtitle}</span>
        </div>

        <div className="stack">
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`placeholder-line placeholder-card__line placeholder-card__line--${(index % 3) + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
