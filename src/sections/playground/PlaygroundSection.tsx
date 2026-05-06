import { type CSSProperties, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react'

import { SectionShell } from '../../components/shared/SectionShell'
import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { playgroundProjects, type PlaygroundProject } from '../../data/siteData'
import './PlaygroundSection.less'

type HexVariant = 'base' | 'accent' | 'soft'

type ViewportSize = {
  width: number
  height: number
}

type CameraState = {
  x: number
  y: number
}

type AxialCoord = {
  q: number
  r: number
}

type HoneycombCell = {
  id: string
  q: number
  r: number
  x: number
  y: number
  width: number
  height: number
  variant: HexVariant
  projectIndex: number
  project: PlaygroundProject
  lane: 'title' | 'summary' | 'stack' | 'status'
}

type HoneycombLayout = {
  cells: HoneycombCell[]
  hexRadius: number
  hexWidth: number
  hexHeight: number
  centerProjectIndex: number
}

type DragState = {
  active: boolean
  pointerId: number
  startX: number
  startY: number
  startCameraX: number
  startCameraY: number
  lastX: number
  lastY: number
  lastTime: number
  moved: boolean
}

const SQRT3 = Math.sqrt(3)

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

function positiveMod(value: number, modulus: number) {
  if (modulus <= 0) {
    return 0
  }

  return ((value % modulus) + modulus) % modulus
}

function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

function axialToPixel(coord: AxialCoord, radius: number) {
  return {
    x: radius * SQRT3 * (coord.q + coord.r / 2),
    y: radius * 1.5 * coord.r,
  }
}

function pixelToAxial(x: number, y: number, radius: number): AxialCoord {
  return {
    q: (SQRT3 / 3 * x - 1 / 3 * y) / radius,
    r: (2 / 3 * y) / radius,
  }
}

function buildHoneycombLayout(
  projects: PlaygroundProject[],
  viewport: ViewportSize,
  camera: CameraState,
): HoneycombLayout {
  if (projects.length === 0) {
    return {
      cells: [],
      hexRadius: 0,
      hexWidth: 0,
      hexHeight: 0,
      centerProjectIndex: 0,
    }
  }

  const hexRadius = clamp(Math.round(Math.min(viewport.width, viewport.height) * 0.255), 228, 392)
  const hexWidth = SQRT3 * hexRadius
  const hexHeight = hexRadius * 2
  const rowStep = hexRadius * 1.5
  const qSpan = Math.ceil(viewport.width / hexWidth) + 4
  const rSpan = Math.ceil(viewport.height / rowStep) + 4
  const center = pixelToAxial(camera.x, camera.y, hexRadius)
  const centerQ = Math.round(center.q)
  const centerR = Math.round(center.r)
  const cells: HoneycombCell[] = []
  let bestProjectIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  for (let r = Math.floor(centerR - rSpan); r <= Math.ceil(centerR + rSpan); r += 1) {
    for (let q = Math.floor(centerQ - qSpan); q <= Math.ceil(centerQ + qSpan); q += 1) {
      const world = axialToPixel({ q, r }, hexRadius)
      const screenX = viewport.width / 2 + world.x - camera.x
      const screenY = viewport.height / 2 + world.y - camera.y
      const projectedLeft = screenX - hexWidth / 2
      const projectedTop = screenY - hexHeight / 2
      const visible =
        projectedLeft < viewport.width + hexWidth * 0.75 &&
        projectedLeft + hexWidth > -hexWidth * 0.75 &&
        projectedTop < viewport.height + hexHeight * 0.75 &&
        projectedTop + hexHeight > -hexHeight * 0.75

      if (!visible) {
        continue
      }

      const projectIndex = positiveMod(q * 31 + r * 17, projects.length)
      const project = projects[projectIndex]
      const laneIndex = positiveMod(q + r, 4)
      const lane: HoneycombCell['lane'] =
        laneIndex === 0 ? 'title' : laneIndex === 1 ? 'summary' : laneIndex === 2 ? 'stack' : 'status'
      const variant: HexVariant =
        lane === 'title'
          ? 'accent'
          : lane === 'stack'
            ? 'soft'
            : positiveMod(q * 7 + r * 5, 3) === 0
              ? 'soft'
              : 'base'
      const distance = Math.hypot(screenX - viewport.width / 2, screenY - viewport.height / 2)

      if (distance < bestDistance) {
        bestDistance = distance
        bestProjectIndex = projectIndex
      }

      cells.push({
        id: `hex-${q}-${r}`,
        q,
        r,
        x: projectedLeft,
        y: projectedTop,
        width: hexWidth,
        height: hexHeight,
        variant,
        projectIndex,
        project,
        lane,
      })
    }
  }

  return {
    cells,
    hexRadius,
    hexWidth,
    hexHeight,
    centerProjectIndex: bestProjectIndex,
  }
}

function getCellContent(cell: HoneycombCell) {
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
      copy: 'Drag the world and keep scanning.',
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
  const stageRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<DragState>({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startCameraX: 0,
    startCameraY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    moved: false,
  })
  const cameraRef = useRef<CameraState>({ x: 0, y: 0 })
  const velocityRef = useRef<CameraState>({ x: 0, y: 0 })
  const inertiaFrameRef = useRef<number>(0)
  const suppressNextClickRef = useRef(false)
  const [viewport, setViewport] = useState<ViewportSize>(getViewportSize)
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [activeProjectIndex, setActiveProjectIndex] = useState(() =>
    buildHoneycombLayout(playgroundProjects, getViewportSize(), { x: 0, y: 0 }).centerProjectIndex,
  )
  const { activeIndex, playgroundRevealProgress } = useAppShellScroll()

  const engaged = activeIndex === 5
  const stageProgress = engaged ? clamp(playgroundRevealProgress, 0, 1) : 0
  const stageRise = smoothstep(0, 0.7, stageProgress)
  const stageFill = smoothstep(0.08, 0.88, stageProgress)
  const titleProgress = smoothstep(0.02, 0.56, stageProgress)
  const stageWidth = viewport.width > 0 ? Math.round(lerp(Math.min(viewport.width * 0.7, 960), viewport.width, stageFill)) : 0
  const stageHeight = viewport.height > 0 ? Math.round(lerp(Math.min(viewport.height * 0.52, 640), viewport.height, stageFill)) : 0
  const stageScale = lerp(0.96, 1, stageFill)
  const stageLift = lerp(18, 0, stageRise)
  const layout = useMemo(
    () => buildHoneycombLayout(playgroundProjects, { width: stageWidth, height: stageHeight }, camera),
    [stageWidth, stageHeight, camera],
  )

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    const updateViewport = () => setViewport(getViewportSize())
    window.addEventListener('resize', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('playground-grid-cursor-state', {
        detail: { active: engaged, dragging: engaged && isDragging },
      }),
    )

    if (!engaged) {
      dragRef.current.active = false
      velocityRef.current.x = 0
      velocityRef.current.y = 0
      if (inertiaFrameRef.current !== 0) {
        window.cancelAnimationFrame(inertiaFrameRef.current)
        inertiaFrameRef.current = 0
      }
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
    const stopInertia = () => {
      if (inertiaFrameRef.current !== 0) {
        window.cancelAnimationFrame(inertiaFrameRef.current)
        inertiaFrameRef.current = 0
      }
    }

    return () => {
      stopInertia()
    }
  }, [])

  const applyPointer = (clientX: number, clientY: number) => {
    const stage = stageRef.current
    if (!stage) {
      return
    }

    const rect = stage.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      return
    }

    const pointerX = clamp((clientX - rect.left) / rect.width, 0, 1)
    const pointerY = clamp((clientY - rect.top) / rect.height, 0, 1)
    stage.style.setProperty('--playground-pointer-x', `${(pointerX * 100).toFixed(2)}%`)
    stage.style.setProperty('--playground-pointer-y', `${(pointerY * 100).toFixed(2)}%`)
  }

  const updateCamera = (next: CameraState) => {
    cameraRef.current = next
    setCamera(next)
  }

  const stopInertia = () => {
    if (inertiaFrameRef.current !== 0) {
      window.cancelAnimationFrame(inertiaFrameRef.current)
      inertiaFrameRef.current = 0
    }
  }

  const startInertia = () => {
    stopInertia()

    const tick = () => {
      cameraRef.current = {
        x: cameraRef.current.x + velocityRef.current.x,
        y: cameraRef.current.y + velocityRef.current.y,
      }
      velocityRef.current = {
        x: velocityRef.current.x * 0.9,
        y: velocityRef.current.y * 0.9,
      }
      setCamera({ ...cameraRef.current })

      const speed = Math.hypot(velocityRef.current.x, velocityRef.current.y)
      if (speed < 0.08) {
        velocityRef.current.x = 0
        velocityRef.current.y = 0
        inertiaFrameRef.current = 0
        return
      }

      inertiaFrameRef.current = window.requestAnimationFrame(tick)
    }

    inertiaFrameRef.current = window.requestAnimationFrame(tick)
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!engaged) {
      return
    }

    stopInertia()
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startCameraX: cameraRef.current.x,
      startCameraY: cameraRef.current.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      moved: false,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!engaged) {
      return
    }

    applyPointer(event.clientX, event.clientY)

    if (!dragRef.current.active) {
      return
    }

    const now = performance.now()
    const deltaX = event.clientX - dragRef.current.startX
    const deltaY = event.clientY - dragRef.current.startY
    const moveX = event.clientX - dragRef.current.lastX
    const moveY = event.clientY - dragRef.current.lastY
    const elapsed = Math.max(now - dragRef.current.lastTime, 16)
    const distance = Math.hypot(deltaX, deltaY)

    if (!dragRef.current.moved && distance > 6) {
      dragRef.current.moved = true
      suppressNextClickRef.current = true
    }

    const nextCamera = {
      x: dragRef.current.startCameraX - deltaX,
      y: dragRef.current.startCameraY - deltaY,
    }

    updateCamera(nextCamera)
    velocityRef.current = {
      x: -(moveX / elapsed) * 16,
      y: -(moveY / elapsed) * 16,
    }
    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY
    dragRef.current.lastTime = now
  }

  const finishDrag = () => {
    if (!dragRef.current.active) {
      return
    }

    dragRef.current.active = false
    setIsDragging(false)

    if (dragRef.current.moved) {
      startInertia()
    } else {
      velocityRef.current = { x: 0, y: 0 }
    }
  }

  const handlePointerUp = () => finishDrag()
  const handlePointerCancel = () => finishDrag()

  const handlePointerLeave = () => {
    if (!dragRef.current.active) {
      const stage = stageRef.current
      if (!stage) {
        return
      }

      stage.style.setProperty('--playground-pointer-x', '50%')
      stage.style.setProperty('--playground-pointer-y', '50%')
    }
  }

  const handleDoubleClick = () => {
    stopInertia()
    suppressNextClickRef.current = true
    cameraRef.current = { x: 0, y: 0 }
    velocityRef.current = { x: 0, y: 0 }
    updateCamera({ x: 0, y: 0 })
  }

  return (
    <SectionShell id="playground">
      <section
        className={`playground-showcase${engaged ? ' playground-showcase--engaged' : ''}`}
        aria-labelledby="playground-showcase-title"
      >
        <div className="playground-showcase__frame">
          <header className="playground-showcase__header-layer">
            <h2
              id="playground-showcase-title"
              className="playground-showcase__title"
              style={
                {
                  '--playground-title-progress': String(titleProgress),
                } as CSSProperties
              }
            >
              Playground
            </h2>
          </header>

          <div className="playground-showcase__stage-shell">
            <div
              ref={stageRef}
              className="playground-showcase__stage"
              style={
                {
              '--playground-stage-width': `${stageWidth}px`,
              '--playground-stage-height': `${stageHeight}px`,
              '--playground-stage-radius': `${Math.round(lerp(40, 0, stageFill))}px`,
              '--playground-stage-scale': String(stageScale),
              '--playground-stage-lift': `${stageLift}px`,
              '--playground-camera-x': `${camera.x}px`,
                  '--playground-camera-y': `${camera.y}px`,
                  '--playground-hex-radius': `${layout.hexRadius}px`,
                  '--playground-hex-width': `${layout.hexWidth}px`,
                  '--playground-hex-height': `${layout.hexHeight}px`,
                } as CSSProperties
              }
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerLeave={handlePointerLeave}
              onDoubleClick={handleDoubleClick}
            >
              <div className="playground-showcase__surface">
                <div className="playground-showcase__atmosphere" />
                <div className="playground-showcase__mask" />

                <div className="playground-showcase__world">
                  <div className="playground-showcase__grid" aria-label="Project honeycomb grid">
                    {layout.cells.map((cell) => {
                      const content = getCellContent(cell)
                      const isActive = cell.projectIndex === activeProjectIndex

                      return (
                        <button
                          key={cell.id}
                          type="button"
                          className={`playground-showcase__hex playground-showcase__hex--${cell.variant}${isActive ? ' playground-showcase__hex--active' : ''}`}
                          style={
                            {
                              '--hex-left': `${cell.x}px`,
                              '--hex-top': `${cell.y}px`,
                              '--hex-width': `${cell.width}px`,
                              '--hex-height': `${cell.height}px`,
                            } as CSSProperties
                          }
                          aria-label={`${cell.project.title} ${content.kicker} ${content.title}`}
                          aria-pressed={isActive}
                          onClick={() => {
                            if (suppressNextClickRef.current) {
                              suppressNextClickRef.current = false
                              return
                            }

                            setActiveProjectIndex(cell.projectIndex)
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </SectionShell>
  )
}
