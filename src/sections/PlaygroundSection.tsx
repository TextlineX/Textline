import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { SectionShell } from '../components/shared/SectionShell'
import { useAppShellScroll } from '../components/layout/AppShellScrollContext'
import './PlaygroundSection.less'

type HexCell = {
  id: string
  x: number
  y: number
  radius: number
  label: string
  tone: 'base' | 'accent' | 'soft'
}

const labels = ['HEX', 'GRID', 'MOVE', 'DRAG', 'PAN', 'FLOW', 'NODE', 'CELL', 'SYNC', 'TRACE', 'MODE', 'LOCK']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function buildHexCells() {
  const cells: HexCell[] = []
  const cols = 13
  const rows = 9
  const radius = 64
  const horizontalStep = radius * 1.5
  const verticalStep = radius * Math.sqrt(3) * 0.82
  const startX = 180
  const startY = 170

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const offsetX = row % 2 === 0 ? 0 : horizontalStep / 2
      const tone = (row + col) % 4 === 0 ? 'accent' : (row + col) % 3 === 0 ? 'soft' : 'base'

      cells.push({
        id: `hex-${row}-${col}`,
        x: startX + col * horizontalStep + offsetX,
        y: startY + row * verticalStep,
        radius,
        label: labels[(row * cols + col) % labels.length],
        tone,
      })
    }
  }

  return cells
}

export function PlaygroundSection() {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const surfaceRef = useRef<HTMLDivElement | null>(null)
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  })
  const offsetRef = useRef({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const { activeIndex, scrollProgress } = useAppShellScroll()

  const engaged = activeIndex === 5
  const cells = useMemo(() => buildHexCells(), [])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('playground-grid-cursor-state', {
        detail: { active: engaged, dragging: isDragging },
      }),
    )

    if (!engaged) {
      setIsDragging(false)
    }

    return () => {
      window.dispatchEvent(
        new CustomEvent('playground-grid-cursor-state', {
          detail: { active: false, dragging: false },
        }),
      )
    }
  }, [engaged, isDragging])

  useEffect(() => {
    const root = rootRef.current
    const surface = surfaceRef.current

    if (!root || !surface) {
      return
    }

    const applyTransform = () => {
      surface.style.setProperty('--playground-offset-x', `${offsetRef.current.x}px`)
      surface.style.setProperty('--playground-offset-y', `${offsetRef.current.y}px`)
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!engaged) {
        return
      }

      dragStateRef.current = {
        active: true,
        startX: event.clientX,
        startY: event.clientY,
        startOffsetX: offsetRef.current.x,
        startOffsetY: offsetRef.current.y,
      }

      setIsDragging(true)
      root.setPointerCapture(event.pointerId)
      event.preventDefault()
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!engaged) {
        return
      }

      const rect = root.getBoundingClientRect()
      const pointerX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const pointerY = clamp((event.clientY - rect.top) / rect.height, 0, 1)

      root.style.setProperty('--playground-pointer-x', `${(pointerX * 100).toFixed(2)}%`)
      root.style.setProperty('--playground-pointer-y', `${(pointerY * 100).toFixed(2)}%`)

      if (!dragStateRef.current.active) {
        return
      }

      const deltaX = event.clientX - dragStateRef.current.startX
      const deltaY = event.clientY - dragStateRef.current.startY
      offsetRef.current.x = dragStateRef.current.startOffsetX + deltaX
      offsetRef.current.y = dragStateRef.current.startOffsetY + deltaY
      applyTransform()
    }

    const finishDrag = () => {
      if (!dragStateRef.current.active) {
        return
      }

      dragStateRef.current.active = false
      setIsDragging(false)
    }

    const handlePointerUp = () => {
      finishDrag()
    }

    const handlePointerCancel = () => {
      finishDrag()
    }

    const handlePointerLeave = () => {
      if (!dragStateRef.current.active) {
        root.style.setProperty('--playground-pointer-x', '50%')
        root.style.setProperty('--playground-pointer-y', '50%')
      }
    }

    const handleDoubleClick = () => {
      offsetRef.current.x = 0
      offsetRef.current.y = 0
      applyTransform()
    }

    root.addEventListener('pointerdown', handlePointerDown)
    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerup', handlePointerUp)
    root.addEventListener('pointercancel', handlePointerCancel)
    root.addEventListener('pointerleave', handlePointerLeave)
    root.addEventListener('dblclick', handleDoubleClick)
    applyTransform()

    return () => {
      root.removeEventListener('pointerdown', handlePointerDown)
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerup', handlePointerUp)
      root.removeEventListener('pointercancel', handlePointerCancel)
      root.removeEventListener('pointerleave', handlePointerLeave)
      root.removeEventListener('dblclick', handleDoubleClick)
    }
  }, [engaged])

  return (
    <SectionShell id="playground">
      <section className={`playground-showcase${engaged ? ' playground-showcase--engaged' : ''}`} aria-labelledby="playground-showcase-title">
        <div ref={rootRef} className="playground-showcase__frame">
          <div ref={surfaceRef} className="playground-showcase__surface">
            <div className="playground-showcase__glow" />

            <div className="playground-showcase__grid" aria-hidden="true">
              {cells.map((cell) => (
                <button
                  key={cell.id}
                  type="button"
                  className={`playground-showcase__hex playground-showcase__hex--${cell.tone}`}
                  style={
                    {
                      '--hex-x': `${cell.x}px`,
                      '--hex-y': `${cell.y}px`,
                      '--hex-size': `${cell.radius}px`,
                    } as CSSProperties
                  }
                  aria-label={`${cell.label} node`}
                >
                  <span className="playground-showcase__hex-label">{cell.label}</span>
                </button>
              ))}
            </div>

            <div className="playground-showcase__hud">
              <div className="playground-showcase__eyebrow">Playground</div>
              <h2 id="playground-showcase-title" className="playground-showcase__title">
                Honeycomb mode
              </h2>
              <p className="playground-showcase__subtitle">
                Drag the canvas. Double click to reset. Cursor mode switches automatically while this section is active.
              </p>
            </div>

            <div className="playground-showcase__status">
              <span className="playground-showcase__status-item">SECTION {String(activeIndex).padStart(2, '0')}</span>
              <span className="playground-showcase__status-item">PROGRESS {Math.round(scrollProgress * 100)}%</span>
              <span className="playground-showcase__status-item">{isDragging ? 'DRAGGING' : 'READY'}</span>
            </div>
          </div>
        </div>
      </section>
    </SectionShell>
  )
}
