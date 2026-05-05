import type { CSSProperties } from 'react'

import './WorksModePanel.less'

type WorksModePanelProps = {
  engaged: boolean
}

const statusRows = [
  { key: 'mode', label: 'MODE', value: 'WORKS_TUNNEL' },
  { key: 'pointer', label: 'POINTER', value: 'RE-ROUTED' },
  { key: 'motion', label: 'MOTION', value: 'PROGRESSIVE_REVEAL' },
  { key: 'state', label: 'STATE', value: 'LIVE' },
]

const projectItems = [
  {
    title: 'Chaoxing AI',
    summary: '作业解析、自动回填与 OCR 流程拼接。',
    stack: 'Go / OCR / RPA',
  },
  {
    title: 'Textline',
    summary: '3D 叙事简历、滚动状态机与定制光标系统。',
    stack: 'React / Motion / Three.js',
  },
  {
    title: 'RPA Matrix',
    summary: '面向桌面的多任务编排和智能流程入口。',
    stack: 'Electron / Python / WebSocket',
  },
]

export function WorksModePanel({ engaged }: WorksModePanelProps) {
  return (
    <div className={`works-mode-panel${engaged ? ' works-mode-panel--engaged' : ''}`} aria-hidden="true">
      <div className="works-mode-panel__status surface">
        <div className="works-mode-panel__eyebrow">Mode Shift</div>
        <div className="works-mode-panel__title">Entering controlled pointer space.</div>

        <div className="works-mode-panel__rows">
          {statusRows.map((row, index) => (
            <div
              key={row.key}
              className="works-mode-panel__row"
              style={{ '--reveal-index': index } as CSSProperties}
            >
              <span className="works-mode-panel__row-label">{row.label}</span>
              <span className="works-mode-panel__row-value">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="works-mode-panel__signal">
        <div className="works-mode-panel__signal-line" style={{ '--reveal-index': 4 } as CSSProperties}>
          Wormhole synced to pointer drift.
        </div>
        <div className="works-mode-panel__signal-line" style={{ '--reveal-index': 5 } as CSSProperties}>
          Content nodes unlocked in sequence.
        </div>
      </div>

      <div className="works-mode-panel__cards">
        {projectItems.map((item, index) => (
          <article
            key={item.title}
            className="works-mode-panel__card surface"
            style={{ '--reveal-index': index + 6 } as CSSProperties}
          >
            <div className="works-mode-panel__card-title">{item.title}</div>
            <p className="works-mode-panel__card-summary">{item.summary}</p>
            <div className="works-mode-panel__card-stack">{item.stack}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
