import './CornerIcon.less'

type CornerIconProps = {
  open: boolean
  onToggle: () => void
}

export function CornerIcon({ open, onToggle }: CornerIconProps) {
  return (
    <button
      className={`corner-icon magnetic-target${open ? ' corner-icon--open' : ''}`}
      type="button"
      data-magnetic-shell="compact"
      aria-label={open ? '关闭菜单' : '打开菜单'}
      aria-expanded={open}
      onClick={onToggle}
    >
      <svg className="corner-icon__svg" viewBox="0 0 48 48" aria-hidden="true">
        <rect className="corner-icon__frame" x="8" y="8" width="32" height="32" rx="5" ry="5" />

        <g className="corner-icon__bars">
          <path className="corner-icon__line corner-icon__line--top" d="M15 18H33" />
          <path className="corner-icon__line corner-icon__line--mid" d="M15 24H33" />
          <path className="corner-icon__line corner-icon__line--bot" d="M15 30H33" />
        </g>

        <rect className="corner-icon__core" x="17" y="17" width="14" height="14" rx="3" ry="3" />
      </svg>
      <span className="corner-icon__glow" aria-hidden="true" />
    </button>
  )
}
