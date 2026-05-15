import { useEffect, useRef, useState } from 'react'

import { textFlowTokens } from '../../data/textFlowTokens'
import './AsciiWavesBackdrop.less'

type Point = {
  x: number
  y: number
  cursor: {
    x: number
    y: number
    vx: number
    vy: number
  }
}

type MouseState = {
  x: number
  y: number
  lx: number
  ly: number
  sx: number
  sy: number
  v: number
  vs: number
  a: number
}

type Size = {
  width: number
  height: number
}

const glyphs = ' .,:;i1tftL0X#'
const accentColor = 'rgba(168, 230, 255, 0.92)'
const mutedColor = 'rgba(232, 232, 232, 0.34)'
const textColor = 'rgba(242, 242, 242, 0.62)'
function pickGlyph(intensity: number) {
  const clamped = Math.max(0, Math.min(1, intensity))
  const index = Math.floor(clamped * (glyphs.length - 1))
  return glyphs[index]
}

function buildGrid(width: number, height: number) {
  const cellWidth = 32
  const cellHeight = 42
  const cols = Math.ceil(width / cellWidth) + 2
  const rows = Math.ceil(height / cellHeight) + 2
  const xStart = Math.floor((width - cols * cellWidth) / 2)
  const yStart = Math.floor((height - rows * cellHeight) / 2)

  return Array.from({ length: cols }, (_, columnIndex) =>
    Array.from({ length: rows }, (_, rowIndex) => ({
      x: xStart + columnIndex * cellWidth,
      y: yStart + rowIndex * cellHeight,
      cursor: { x: 0, y: 0, vx: 0, vy: 0 },
    })),
  )
}

export function AsciiWavesBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<MouseState>({
    x: 0,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
  })
  const frameRef = useRef<number>(0)
  const gridRef = useRef<Point[][]>([])
  const canvasRectRef = useRef({ left: 0, top: 0, width: 1, height: 1 })
  const lastDrawAtRef = useRef(0)
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasRectRef.current
      mouseRef.current.x = event.clientX - rect.left
      mouseRef.current.y = event.clientY - rect.top
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || size.width === 0 || size.height === 0) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = Math.floor(size.width * dpr)
    canvas.height = Math.floor(size.height * dpr)
    canvas.style.width = `${size.width}px`
    canvas.style.height = `${size.height}px`
    canvasRectRef.current = canvas.getBoundingClientRect()

    gridRef.current = buildGrid(size.width, size.height)

    let disposed = false
    const holeWidth = Math.min(size.width * 0.76, 1080)
    const holeHeight = Math.min(size.height * 0.7, 760)
    const holeRadiusX = holeWidth / 2
    const holeRadiusY = holeHeight / 2
    const characters = textFlowTokens

    const draw = (time: number) => {
      if (disposed) {
        return
      }

      if (time - lastDrawAtRef.current < 33) {
        frameRef.current = window.requestAnimationFrame(draw)
        return
      }
      lastDrawAtRef.current = time

      const mouse = mouseRef.current
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      context.clearRect(0, 0, size.width, size.height)
      context.globalAlpha = 1

      mouse.sx += (mouse.x - mouse.sx) * 0.1
      mouse.sy += (mouse.y - mouse.sy) * 0.1

      const dx = mouse.x - mouse.lx
      const dy = mouse.y - mouse.ly
      const movement = Math.hypot(dx, dy)
      mouse.v = movement
      mouse.vs += (movement - mouse.vs) * 0.1
      mouse.vs = Math.min(120, mouse.vs)
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      mouse.a = Math.atan2(dy, dx)

      context.font = '700 15px ui-monospace, SFMono-Regular, Consolas, monospace'
      context.textBaseline = 'middle'
      context.textAlign = 'center'

      gridRef.current.forEach((column, columnIndex) => {
        column.forEach((point, rowIndex) => {
          const holeOffsetY = Math.round(size.height * 0.02)
          const centerDx = point.x - size.width / 2
          const centerDy = point.y - (size.height / 2 + holeOffsetY)
          const insideHole = (centerDx * centerDx) / (holeRadiusX * holeRadiusX) + (centerDy * centerDy) / (holeRadiusY * holeRadiusY) < 1
          if (insideHole) {
            return
          }

          const normalizedX = centerDx / (size.width * 0.5)
          const normalizedY = centerDy / (size.height * 0.5)
          const distance = Math.sqrt((normalizedX * normalizedX) + (normalizedY * normalizedY))
          const edgeFade = Math.max(0, Math.min(1, 1 - Math.pow(distance, 1.8)))
          if (edgeFade < 0.08) {
            return
          }

          const distToMouse = Math.hypot(point.x - mouse.sx, point.y - mouse.sy)
          const influence = Math.max(160, mouse.vs * 1.2)
          const proximity = Math.max(0, 1 - distToMouse / influence)
          const wave = (Math.sin(time * 0.00026 + columnIndex * 0.16) + Math.cos(time * 0.00022 + rowIndex * 0.12)) * 0.025
          const intensity = Math.max(0, Math.min(1, 0.05 + wave + proximity * 0.58)) * edgeFade
          const shouldSkip = (columnIndex + rowIndex) % 4 === 0 && proximity < 0.18

          if (shouldSkip) {
            return
          }

          if (proximity > 0) {
            point.cursor.vx += Math.cos(mouse.a) * proximity * mouse.vs * 0.01
            point.cursor.vy += Math.sin(mouse.a) * proximity * mouse.vs * 0.01
          }

          point.cursor.vx += (0 - point.cursor.x) * 0.005
          point.cursor.vy += (0 - point.cursor.y) * 0.005
          point.cursor.vx *= 0.86
          point.cursor.vy *= 0.86
          point.cursor.x += point.cursor.vx * 0.65
          point.cursor.y += point.cursor.vy * 0.65

          const glyphSeed = (columnIndex * 7 + rowIndex * 11 + Math.floor(time / 420)) % characters.length
          const glyph = pickGlyph(intensity * 0.96 + glyphSeed * 0.005)
          const drawX = point.x + point.cursor.x
          const drawY = point.y + point.cursor.y

          context.fillStyle = proximity > 0.34 ? accentColor : intensity > 0.22 ? mutedColor : textColor
          context.globalAlpha = Math.max(0.28, edgeFade)
          context.fillText(glyph === ' ' ? characters[glyphSeed] : glyph, drawX, drawY)
        })
      })

      frameRef.current = window.requestAnimationFrame(draw)
    }

    frameRef.current = window.requestAnimationFrame(draw)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameRef.current)
    }
  }, [size])

  return <canvas ref={canvasRef} className="ascii-waves-backdrop" aria-hidden="true" />
}
