import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Matter from 'matter-js'

import './ContactSection.less'

const contactLinks = [
  { label: 'Email', value: 'textlinex@qq.com', href: 'mailto:textlinex@qq.com' },
  { label: 'GitHub', value: 'github.com/TextlineX', href: 'https://github.com/TextlineX?tab=repositories' },
]

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
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

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

const SEGMENT_COUNT = 7
const SEGMENT_LENGTH = 16
const SEGMENT_RADIUS = 5

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const rigStageRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const contactRigRef = useRef<ContactRig | null>(null)
  const frameRef = useRef<number>(0)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const dragStateRef = useRef({
    active: false,
    pointerId: null as number | null,
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

  useLayoutEffect(() => {
    const section = sectionRef.current
    const rigStage = rigStageRef.current
    const canvas = canvasRef.current

    if (!section || !rigStage || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const engine = Matter.Engine.create({ enableSleeping: true })
    engine.gravity.x = 0
    engine.gravity.y = 0.48
    engine.gravity.scale = 0.0007

    const getAnchorPoint = () => {
      const rigRect = rigStage.getBoundingClientRect()
      const titleEl = titleRef.current

      if (titleEl) {
        const titleRect = titleEl.getBoundingClientRect()
        return {
          x: titleRect.right - 10 - rigRect.left,
          y: titleRect.bottom - 20 - rigRect.top,
        }
      }

      return {
        x: rigRect.width / 2,
        y: rigRect.height * 0.35,
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
      const point = getAnchorPoint()
      const anchor = Matter.Bodies.circle(point.x, point.y, 4, {
        isStatic: true,
      })

      const rope = Array.from({ length: SEGMENT_COUNT }, (_, index) =>
        Matter.Bodies.circle(point.x, point.y + SEGMENT_LENGTH * (index + 1), SEGMENT_RADIUS, {
          frictionAir: 0.08,
          inertia: Infinity,
        }),
      )

      const payload = Matter.Bodies.rectangle(
        point.x,
        point.y + SEGMENT_LENGTH * (SEGMENT_COUNT + 1) + 20,
        72,
        72,
        {
          chamfer: { radius: 18 },
          frictionAir: 0.08,
          density: 0.002,
          inertia: Infinity,
        },
      )

      const constraints: Matter.Constraint[] = []
      let previous = anchor
      for (const body of [...rope, payload]) {
        constraints.push(
          Matter.Constraint.create({
            bodyA: previous,
            bodyB: body,
            length: SEGMENT_LENGTH,
            stiffness: 0.9,
            damping: 0.06,
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const recenterRig = () => {
      const rig = contactRigRef.current
      if (!rig) return

      const next = getAnchorPoint()
      const deltaX = next.x - rig.anchor.position.x
      const deltaY = next.y - rig.anchor.position.y

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

      for (const body of [rig.anchor, ...rig.rope, rig.payload]) {
        Matter.Body.setPosition(body, {
          x: body.position.x + deltaX,
          y: body.position.y + deltaY,
        })
        Matter.Body.setVelocity(body, { x: 0, y: 0 })
      }
    }

    const syncImage = () => {
      if (imageRef.current) return
      const image = new Image()
      image.src = '/images/arisu_logo.png'
      imageRef.current = image
    }

    const applyDragPosition = (event: PointerEvent) => {
      const rig = contactRigRef.current
      if (!rig) return

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
      if (!dragState.active || dragState.pointerId !== event.pointerId) return
      applyDragPosition(event)
      event.preventDefault()
    }

    const handlePointerEnd = (event: PointerEvent) => {
      const dragState = dragStateRef.current
      if (!dragState.active || dragState.pointerId !== event.pointerId) return

      const rig = contactRigRef.current
      if (rig) {
        const point = getPointerPoint(event)
        const elapsed = Math.max(performance.now() - dragState.startTime, 16)
        const releaseVx = ((point.x - dragState.startX) / elapsed) * 16
        const releaseVy = ((point.y - dragState.startY) / elapsed) * 16
        const totalSpeed = Math.hypot(releaseVx, releaseVy)
        const strongFlick = dragState.peakSpeed > 6.5 || totalSpeed > 5.2
        const strongPull = dragState.totalDy < -110 || Math.abs(dragState.totalDx) > 180

        Matter.Body.setVelocity(rig.payload, {
          x: clamp(rig.payload.velocity.x + clamp(releaseVx * 0.7, -5, 5), -7, 7),
          y: clamp(rig.payload.velocity.y + clamp(releaseVy * 0.7, -12, 8), -18, 8),
        })

        if (strongFlick || strongPull) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
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

      ctx.clearRect(0, 0, width, height)

      if (!rig) return

      const ropePoints = [rig.anchor, ...rig.rope].map((body) => ({
        x: body.position.x,
        y: body.position.y,
      }))

      const imageWidth = clamp(width * 0.13, 60, 90)
      const imageHeight = imageWidth
      const payloadX = clamp(rig.payload.position.x, imageWidth * 0.5, width - imageWidth * 0.5)
      const payloadY = clamp(rig.payload.position.y + imageHeight * 0.08, imageHeight * 0.55, height - imageHeight * 0.4)
      const ropeTail = {
        x: payloadX,
        y: payloadY - imageHeight * 0.5 + 4,
      }

      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      ctx.shadowBlur = 4
      ctx.lineWidth = 2
      ctx.beginPath()
      const springPath = buildSpringPath(ropePoints[0], ropeTail, 5)
      ctx.stroke(new Path2D(springPath))
      ctx.restore()

      if (image && image.complete && image.naturalWidth > 0) {
        ctx.save()
        ctx.drawImage(image, payloadX - imageWidth / 2, payloadY - imageHeight / 2 + 6, imageWidth, imageHeight)
        ctx.restore()
      }

      ctx.beginPath()
      ctx.arc(rig.anchor.position.x, rig.anchor.position.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fill()
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

    const handleWheel = (e: WheelEvent) => {
      const rig = contactRigRef.current
      if (rig) {
        const intensity = clamp(Math.abs(e.deltaY) / 1000, 0.08, 1)
        const direction = e.deltaY >= 0 ? 1 : -1

        Matter.Body.applyForce(rig.payload, rig.payload.position, {
          x: 0,
          y: direction * intensity * 0.00012,
        })

        Matter.Body.setVelocity(rig.payload, {
          x: clamp(rig.payload.velocity.x * 0.4, -0.35, 0.35),
          y: clamp(rig.payload.velocity.y + direction * intensity * 0.24, -1.8, 1.8),
        })

        rig.rope.forEach((body, index) => {
          Matter.Body.applyForce(body, body.position, {
            x: 0,
            y: direction * intensity * 0.00004 * (1 - index * 0.12),
          })
        })
      }
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })

    const targets = [...linkRefs.current].filter(Boolean)
    gsap.set(targets, { x: 1.6, yPercent: 100 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to(linkRefs.current.filter(Boolean), { x: 1.6, yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerEnd)
      canvas.removeEventListener('pointercancel', handlePointerEnd)
      canvas.removeEventListener('wheel', handleWheel)
      resizeObserver.disconnect()
      cancelAnimationFrame(frameRef.current)
      Matter.Composite.clear(engine.world, false, true)
      Matter.Engine.clear(engine)
      contactRigRef.current = null
      imageRef.current = null
      tl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="contact-section" aria-labelledby="contact-section-title">
      <div ref={rigStageRef} className="contact-section__rig">
        <canvas ref={canvasRef} className="contact-section__canvas" />
      </div>

      <h1 ref={titleRef} className="contact-section__title" id="contact-section-title">
        CONTACT
      </h1>

      <footer className="contact-section__footer">
        {contactLinks.map((link, i) => (
          <a
            key={link.label}
            ref={(el) => { linkRefs.current[i] = el }}
            href={link.href}
            className="contact-section__link"
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            <span className="contact-section__link-label">{link.label}</span>
            <span>{link.value}</span>
          </a>
        ))}
      </footer>
    </section>
  )
}
