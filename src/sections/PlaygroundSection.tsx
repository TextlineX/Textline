import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react'

import { SectionShell } from '../components/shared/SectionShell'
import { useAppShellScroll } from '../components/layout/AppShellScrollContext'
import { playgroundProjects, type PlaygroundProject } from '../data/siteData'
import './PlaygroundSection.less'

type HexVariant = 'base' | 'accent' | 'soft'

type HexCell = {
  id: string
  x: number
  y: number
  radius: number
  variant: HexVariant
  projectIndex: number
  project: PlaygroundProject
  lane: 'title' | 'summary' | 'stack' | 'status'
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function buildHexCells(projects: PlaygroundProject[]) {
  const cells: HexCell[] = []
  const cols = 6
  const rows = 4
  const radius = 128
  const horizontalStep = radius * 1.5
  const verticalStep = radius * 0.92
  const startX = 104
  const startY = 108

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const projectIndex = (row * 2 + col + (row % 2)) % projects.length
      const project = projects[projectIndex]
      const laneIndex = (row + col) % 4
      const lane: HexCell['lane'] = laneIndex === 0 ? 'title' : laneIndex === 1 ? 'summary' : laneIndex === 2 ? 'stack' : 'status'
      const variant: HexVariant =
        lane === 'title'
          ? 'accent'
          : lane === 'stack'
            ? 'soft'
            : row % 3 === 0
              ? 'soft'
              : 'base'

      cells.push({
        id: `hex-${row}-${col}`,
        x: startX + col * horizontalStep + (row % 2 === 0 ? 0 : horizontalStep / 2),
        y: startY + row * verticalStep,
        radius,
        variant,
        projectIndex,
        project,
        lane,
      })
    }
  }

  return cells
}

function getCellContent(cell: HexCell) {
  if (cell.lane === 'title') {
    return {
      kicker: cell.project.tag,
      title: cell.project.title,
      copy: cell.project.year,
    }
  }

  if (cell.lane === 'summary') {
    return {
      kicker: 'SUMMARY',
      title: cell.project.description,
      copy: 'Drag the surface and keep scanning the grid.',
    }
  }

  if (cell.lane === 'stack') {
    return {
      kicker: 'STACK',
      title: cell.project.stack.join(' / '),
      copy: cell.project.status,
    }
  }

  return {
    kicker: 'STATUS',
    title: cell.project.status,
    copy: `${cell.project.year} · ${cell.project.tag}`,
  }
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
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const { activeIndex, scrollProgress } = useAppShellScroll()

  const engaged = activeIndex === 5
  const cells = useMemo(() => buildHexCells(playgroundProjects), [])
  const activeProject = playgroundProjects[activeProjectIndex % playgroundProjects.length]

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

      const target = event.target as HTMLElement | null
      if (target?.closest('button')) {
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

            <div className="playground-showcase__grid" aria-label="Project honeycomb grid">
              {cells.map((cell) => {
                const content = getCellContent(cell)
                const isActive = cell.projectIndex === activeProjectIndex

                return (
                  <button
                    key={cell.id}
                    type="button"
                    className={`playground-showcase__hex playground-showcase__hex--${cell.variant}${isActive ? ' playground-showcase__hex--active' : ''}`}
                    style={
                      {
                        '--hex-x': `${cell.x}px`,
                        '--hex-y': `${cell.y}px`,
                        '--hex-size': `${cell.radius}px`,
                      } as CSSProperties
                    }
                    aria-label={`${cell.project.title} ${content.kicker} ${content.title}`}
                    aria-pressed={isActive}
                    onClick={() => setActiveProjectIndex(cell.projectIndex)}
                  >
                    <span className="playground-showcase__hex-kicker">{content.kicker}</span>
                    <span className="playground-showcase__hex-title">{content.title}</span>
                    <span className="playground-showcase__hex-copy">{content.copy}</span>
                  </button>
                )
              })}
            </div>

            <div className="playground-showcase__hud">
              <div className="playground-showcase__eyebrow">Playground</div>
              <h2 id="playground-showcase-title" className="playground-showcase__title">
                Honeycomb projects
              </h2>
              <p className="playground-showcase__subtitle">
                网格按固定节奏生成，项目标题、描述、技术栈和状态会在蜂窝中轮换显示。
              </p>
            </div>

            <div className="playground-showcase__detail">
              <div className="playground-showcase__detail-label">ACTIVE PROJECT</div>
              <div className="playground-showcase__detail-title">{activeProject.title}</div>
              <p className="playground-showcase__detail-copy">{activeProject.description}</p>
              <div className="playground-showcase__detail-meta">
                <span>{activeProject.year}</span>
                <span>{activeProject.status}</span>
                <span>{activeProject.tag}</span>
              </div>
              <div className="playground-showcase__detail-stack">{activeProject.stack.join(' / ')}</div>
            </div>

            <div className="playground-showcase__status">
              <span className="playground-showcase__status-item">SECTION {String(activeIndex).padStart(2, '0')}</span>
              <span className="playground-showcase__status-item">PROGRESS {Math.round(scrollProgress * 100)}%</span>
              <span className="playground-showcase__status-item">PROJECT {String(activeProjectIndex + 1).padStart(2, '0')}</span>
              <span className="playground-showcase__status-item">{isDragging ? 'DRAGGING' : 'READY'}</span>
            </div>
          </div>
        </div>
      </section>
    </SectionShell>
  )
}
