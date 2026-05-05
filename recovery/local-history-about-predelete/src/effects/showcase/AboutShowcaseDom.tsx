import './AboutShowcaseDom.less'

const domTags = ['LAYOUT', 'SCREEN', 'DOM', 'MAGNETIC']

const domActions = [
  { label: 'OPEN', shell: 'tight' },
  { label: 'SYNC', shell: 'tight' },
  { label: 'VIEW', shell: 'compact' },
]

export function AboutShowcaseDom() {
  return (
    <div className="about-showcase-dom">
      <div className="about-showcase-dom__top">
        <div className="about-showcase-dom__badge magnetic-target" data-magnetic-shell="compact">
          DOM
        </div>
        <div className="about-showcase-dom__status">
          <span className="about-showcase-dom__status-key">STATE</span>
          <span className="about-showcase-dom__status-value">ACTIVE</span>
        </div>
      </div>

      <div className="about-showcase-dom__grid">
        <div className="about-showcase-dom__panel about-showcase-dom__panel--main magnetic-target" data-magnetic-shell="tight">
          <div className="about-showcase-dom__panel-title">SCREEN LAYER</div>
          <div className="about-showcase-dom__panel-copy">网页结构元素会放在这里。</div>
        </div>

        <div className="about-showcase-dom__panel about-showcase-dom__panel--side magnetic-target" data-magnetic-shell="tight">
          <div className="about-showcase-dom__panel-title">ROUTE</div>
          <div className="about-showcase-dom__panel-copy">可切换不同结构块。</div>
        </div>
      </div>

      <div className="about-showcase-dom__tags" aria-label="dom tags">
        {domTags.map((tag) => (
          <span key={tag} className="about-showcase-dom__tag magnetic-target" data-magnetic-shell="compact">
            {tag}
          </span>
        ))}
      </div>

      <div className="about-showcase-dom__actions">
        {domActions.map((action) => (
          <button key={action.label} type="button" className="about-showcase-dom__action magnetic-target" data-magnetic-shell={action.shell}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
