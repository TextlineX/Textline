import type { CSSProperties } from 'react'

import './WorksModePanel.less'

type WorksModePanelProps = {
  engaged: boolean
  revealProgress: number
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0
  }

  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}

export function WorksModePanel({ engaged, revealProgress }: WorksModePanelProps) {
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
        {projectItems.map((item, index) => {
          const phase = revealProgress * (projectItems.length + 1) - index
          const localProgress = clamp(phase, 0, 1)
          const enter = smoothstep(-0.25, 0.08, phase)
          const exit = 1 - smoothstep(0.78, 1.18, phase)
          const visibility = clamp(enter * exit, 0, 1)
          const farScale = lerp(0.58, 1, localProgress)
          const depth = lerp(940, -110, localProgress)
          const lift = Math.sin((phase + index) * 1.3) * 42 * (1 - visibility)
          const sway = (index % 2 === 0 ? -1 : 1) * (92 - localProgress * 48)
          const style = {
            '--card-opacity': String(visibility),
            '--card-scale': String(farScale),
            '--card-depth': `${depth}px`,
            '--card-rotate': `${(index % 2 === 0 ? -1 : 1) * (1 - visibility) * 5.5}deg`,
            '--card-sway': `${sway}px`,
            '--card-lift': `${lift}px`,
            zIndex: Math.round(visibility * 1000) + index,
          } as CSSProperties

          return (
            <article key={item.title} className="works-mode-panel__card surface" style={style}>
              <div className="works-mode-panel__card-kicker">
                <span>Project {String(index + 1).padStart(2, '0')}</span>
                <span>{`${String(index + 1).padStart(2, '0')} / ${String(projectItems.length).padStart(2, '0')}`}</span>
              </div>
              <div className="works-mode-panel__card-title">{item.title}</div>
              <p className="works-mode-panel__card-summary">{item.summary}</p>
              <div className="works-mode-panel__card-stack">{item.stack}</div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
