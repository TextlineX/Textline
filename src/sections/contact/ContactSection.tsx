import { type WheelEvent, useEffect, useRef } from 'react'
import * as Matter from 'matter-js'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { SectionShell } from '../../components/shared/SectionShell'
import { StickyMagneticTitle } from '../../components/shared/StickyMagneticTitle'
import { useSectionWindow } from '../../hooks/useSectionWindow'
import './ContactSection.less'

type ContactRig = {
  anchor: Matter.Body
  engine: Matter.Engine
  payload: Matter.Body
  rope: Matter.Body[]
}

type Point = {
  x: number
  y: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function smoothPath(points: Point[]) {
  if (points.length === 0) {
    return ''
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1]
    const next = points[index]
    const midX = (prev.x + next.x) / 2
    const midY = (prev.y + next.y) / 2
    path += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`
  }

  const tail = points[points.length - 1]
  path += ` L ${tail.x} ${tail.y}`
  return path
}

function buildSpringPath(start: Point, end: Point, coils: number) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const ux = dx / length
  const uy = dy / length
  const px = -uy
  const py = ux
  const segments = Math.max(8, coils * 4)
  const amplitude = Math.min(14, Math.max(6, length * 0.08))

  const points: Point[] = []
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments
    const along = length * t
    const wave = Math.sin(t * coils * Math.PI * 2) * amplitude
    const taper = Math.sin(Math.min(1, t) * Math.PI)
    points.push({
      x: start.x + ux * along + px * wave * taper,
      y: start.y + uy * along + py * wave * taper,
    })
  }

  return smoothPath(points)
}

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const rigStageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contactRigRef = useRef<ContactRig | null>(null)
  const { requestHome } = useAppShellScroll()
  const { isPreloaded } = useSectionWindow({ sectionIndex: 6, preloadBefore: 3, preloadAfter: 1 })
  const enabled = isPreloaded
  const frameRef = useRef<number | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const dragStateRef = useRef<{
    active: boolean
    pointerId: number | null
    startX: number
    startY: number
    startTime: number
    lastX: number
    lastY: number
    lastTime: number
    peakSpeed: number
    totalDx: number
    totalDy: number
  }>({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    peakSpeed: 0,
    totalDx: 0,
    totalDy: 0,
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    const section = sectionRef.current
    const rigStage = rigStageRef.current
    const canvas = canvasRef.current

    if (!section || !rigStage || !canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const engine = Matter.Engine.create({ enableSleeping: true })
    engine.gravity.x = 0
    engine.gravity.y = 0.48
    engine.gravity.scale = 0.0007

    const segmentCount = 7
    const segmentLength = 16
    const segmentRadius = 5

    const titleToRigPoint = () => {
      const sectionRect = section.getBoundingClientRect()
      const rigRect = rigStage.getBoundingClientRect()
      const titleElement = section.querySelector<HTMLElement>('#contact-showcase-title')
      const titleRect = titleElement?.getBoundingClientRect()

      if (!titleRect) {
        return {
          width: Math.max(rigRect.width, 1),
          height: Math.max(rigRect.height, 1),
          x: Math.max(rigRect.width, 1) / 2,
          y: Math.max(24, Math.max(sectionRect.height, 1) * 0.08),
        }
      }

      return {
        width: Math.max(rigRect.width, 1),
        height: Math.max(rigRect.height, 1),
        x: titleRect.left + titleRect.width / 2 - rigRect.left,
        y: titleRect.bottom - rigRect.top ,
      }
    }

    const getPointerPoint = (event: PointerEvent) => {
      const rect = rigStage.getBoundingClientRect()
      return {
        x: clamp(event.clientX - rect.left, 0, Math.max(rect.width, 1)),
        y: clamp(event.clientY - rect.top, 0, Math.max(rect.height, 1)),
      }
    }

    const makeRig = () => {
      const point = titleToRigPoint()
      const anchor = Matter.Bodies.circle(point.x, point.y, 4, {
        isStatic: true,
        render: { visible: false },
      })

      const rope = Array.from({ length: segmentCount }, (_, index) =>
        Matter.Bodies.circle(point.x, point.y + segmentLength * (index + 1), segmentRadius, {
          frictionAir: 0.08,
          inertia: Infinity,
          render: { visible: false },
        }),
      )

      const payload = Matter.Bodies.rectangle(
        point.x,
        point.y + segmentLength * (segmentCount + 1) + 20,
        72,
        72,
        {
          chamfer: { radius: 18 },
          frictionAir: 0.08,
          density: 0.002,
          inertia: Infinity,
          render: { visible: false },
        },
      )

      const constraints: Matter.Constraint[] = []
      let previous = anchor
      for (const body of [...rope, payload]) {
        constraints.push(
          Matter.Constraint.create({
            bodyA: previous,
            bodyB: body,
            length: segmentLength,
            stiffness: 0.9,
            damping: 0.06,
            render: { visible: false },
          }),
        )
        previous = body
      }

      Matter.World.add(engine.world, [anchor, ...rope, payload, ...constraints])

      contactRigRef.current = {
        anchor,
        engine,
        payload,
        rope,
      }
    }

    const resizeCanvas = () => {
      const rect = rigStage.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const recenterRig = () => {
      const rig = contactRigRef.current
      if (!rig) {
        return
      }

      const next = titleToRigPoint()
      const deltaX = next.x - rig.anchor.position.x
      const deltaY = next.y - rig.anchor.position.y

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        return
      }

      for (const body of [rig.anchor, ...rig.rope, rig.payload]) {
        Matter.Body.setPosition(body, {
          x: body.position.x + deltaX,
          y: body.position.y + deltaY,
        })
        Matter.Body.setVelocity(body, { x: 0, y: 0 })
      }
    }

    const syncImage = () => {
      if (imageRef.current) {
        return
      }

      const image = new Image()
      image.src = '/contact/aris.png'
      imageRef.current = image
    }

    const applyDragPosition = (event: PointerEvent) => {
      const rig = contactRigRef.current
      if (!rig) {
        return
      }

      const dragState = dragStateRef.current
      const point = getPointerPoint(event)
      const now = performance.now()
      const dt = Math.max(now - dragState.lastTime, 16)
      const vx = ((point.x - dragState.lastX) / dt) * 16
      const vy = ((point.y - dragState.lastY) / dt) * 16
      const speed = Math.hypot(vx, vy)

      Matter.Body.setPosition(rig.payload, point)
      Matter.Body.setVelocity(rig.payload, {
        x: clamp(vx * 0.72, -6, 6),
        y: clamp(vy * 0.72, -6, 6),
      })

      for (const body of rig.rope) {
        Matter.Body.setVelocity(body, {
          x: clamp(vx * 0.5, -5, 5),
          y: clamp(vy * 0.5, -5, 5),
        })
      }

      dragState.lastX = point.x
      dragState.lastY = point.y
      dragState.lastTime = now
      dragState.totalDx = point.x - dragState.startX
      dragState.totalDy = point.y - dragState.startY
      dragState.peakSpeed = Math.max(dragState.peakSpeed, speed)
    }

    const handlePointerDown = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      dragState.active = true
      dragState.pointerId = event.pointerId
      dragState.startX = event.clientX
      dragState.startY = event.clientY
      dragState.startTime = performance.now()
      dragState.lastX = event.clientX
      dragState.lastY = event.clientY
      dragState.lastTime = performance.now()
      dragState.peakSpeed = 0
      dragState.totalDx = 0
      dragState.totalDy = 0
      canvas.setPointerCapture(event.pointerId)
      applyDragPosition(event)
      event.preventDefault()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState.active || dragState.pointerId !== event.pointerId) {
        return
      }

      applyDragPosition(event)
      event.preventDefault()
    }

    const handlePointerEnd = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState.active || dragState.pointerId !== event.pointerId) {
        return
      }

      const rig = contactRigRef.current
      if (rig) {
        const point = getPointerPoint(event)
        const elapsed = Math.max(performance.now() - dragState.startTime, 16)
        const releaseVx = ((point.x - dragState.lastX) / elapsed) * 16
        const releaseVy = ((point.y - dragState.lastY) / elapsed) * 16
        const totalSpeed = Math.hypot(releaseVx, releaseVy)
        const strongFlick = dragState.peakSpeed > 6.5 || totalSpeed > 5.2
        const strongPull = dragState.totalDy < -110 || Math.abs(dragState.totalDx) > 180
        const shouldTriggerHome = strongFlick || strongPull

        Matter.Body.setVelocity(rig.payload, {
          x: clamp(rig.payload.velocity.x + clamp(releaseVx * 0.7, -5, 5), -7, 7),
          y: clamp(rig.payload.velocity.y + clamp(releaseVy * 0.7, -12, 8), -18, 8),
        })

        if (shouldTriggerHome) {
          requestHome()
        }
      }

      dragState.active = false
      dragState.pointerId = null
      dragState.peakSpeed = 0
      dragState.totalDx = 0
      dragState.totalDy = 0
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
      event.preventDefault()
    }

    const draw = () => {
      const rig = contactRigRef.current
      const image = imageRef.current
      const rect = rigStage.getBoundingClientRect()
      const width = Math.max(rect.width, 1)
      const height = Math.max(rect.height, 1)

      context.clearRect(0, 0, width, height)

      if (!rig) {
        return
      }

      const ropePoints = [rig.anchor, ...rig.rope].map((body) => ({
        x: body.position.x,
        y: body.position.y,
      }))

      const imageWidth = clamp(width * 0.13, 74, 110)
      const imageHeight = imageWidth
      const payloadX = clamp(rig.payload.position.x, imageWidth * 0.5, width - imageWidth * 0.5)
      const payloadY = clamp(rig.payload.position.y + imageHeight * 0.08, imageHeight * 0.55, height - imageHeight * 0.4)
      const ropeTail = {
        x: payloadX,
        y: payloadY - imageHeight * 0.5 + 4,
      }

      context.save()
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      context.shadowColor = 'rgba(255, 255, 255, 0.14)'
      context.shadowBlur = 10
      context.lineWidth = 2.1
      context.beginPath()
      const springPath = buildSpringPath(ropePoints[0], ropeTail, 5)
      context.stroke(new Path2D(springPath))
      context.restore()

      if (image && image.complete && image.naturalWidth > 0) {
        context.save()
        context.drawImage(
          image,
          payloadX - imageWidth / 2,
          payloadY - imageHeight / 2 + 6,
          imageWidth,
          imageHeight,
        )
        context.restore()
      }
    }

    syncImage()
    resizeCanvas()
    makeRig()
    recenterRig()

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      recenterRig()
    })

    resizeObserver.observe(rigStage)

    const tick = () => {
      const rig = contactRigRef.current
      if (rig) {
        recenterRig()

        Matter.Body.applyForce(rig.payload, rig.payload.position, {
          x: 0,
          y: -0.00008,
        })

        rig.rope.forEach((body, index) => {
          Matter.Body.applyForce(body, body.position, {
            x: 0,
            y: -0.00003 * (1 - index * 0.12),
          })
        })
      }

      Matter.Engine.update(engine, 1000 / 60)
      draw()
      frameRef.current = window.requestAnimationFrame(tick)
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerEnd)
    canvas.addEventListener('pointercancel', handlePointerEnd)
    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerEnd)
      canvas.removeEventListener('pointercancel', handlePointerEnd)
      resizeObserver.disconnect()

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }

      Matter.Composite.clear(engine.world, false, true)
      Matter.Engine.clear(engine)
      contactRigRef.current = null
      imageRef.current = null
    }
  }, [enabled])

  const handleWheelCapture = (event: WheelEvent<HTMLElement>) => {
    const rig = contactRigRef.current
    if (rig) {
      const intensity = clamp(Math.abs(event.deltaY) / 1000, 0.08, 1)

      Matter.Body.applyForce(rig.payload, rig.payload.position, {
        x: 0,
        y: -intensity * 0.00012,
      })

      Matter.Body.setVelocity(rig.payload, {
        x: clamp(rig.payload.velocity.x * 0.4, -0.35, 0.35),
        y: clamp(rig.payload.velocity.y - intensity * 0.24, -1.8, 1.8),
      })

      rig.rope.forEach((body, index) => {
        Matter.Body.applyForce(body, body.position, {
          x: 0,
          y: -intensity * 0.00004 * (1 - index * 0.12),
        })
      })
    }
  }

  return (
    <SectionShell id="contact">
      <section ref={sectionRef} className="contact-showcase" aria-labelledby="contact-showcase-title" onWheelCapture={handleWheelCapture}>
        <StickyMagneticTitle
          as="h2"
          id="contact-showcase-title"
          className="contact-showcase__title-linger"
          sectionIndex={6}
          anchorVh={0.16}
          blurDelayVh={0.08}
          blurSpanVh={0.1}
          blurMaxPx={4}
          followDelayVh={0.02}
          followEase={0.9}
          targetClassName="contact-showcase__title"
          stickTopVh={0.08}
          lingerVh={0.18}
          releaseVh={0.14}
          fadeVh={0.16}
          avatarTrigger
        >
          <span>Contact</span>
        </StickyMagneticTitle>

        <div ref={rigStageRef} className="contact-showcase__rig" aria-hidden="true">
          <canvas ref={canvasRef} className="contact-showcase__canvas" />
        </div>
      </section>
    </SectionShell>
  )
}
