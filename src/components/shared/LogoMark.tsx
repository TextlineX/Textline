import './LogoMark.less'

type LogoMarkProps = {
  onClick?: () => void
}

export function LogoMark({ onClick }: LogoMarkProps) {
  return (
    <button
      className="logo-mark magnetic-target"
      type="button"
      data-magnetic-shell="compact"
      aria-label="回到首页"
      onClick={onClick}
    >
      <img
        className="logo-mark__icon"
        src="/textline-icon-pack/textline-icon-white.svg"
        alt=""
        aria-hidden="true"
      />
    </button>
  )
}
