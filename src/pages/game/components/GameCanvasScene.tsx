import { useEffect, useRef } from 'react'

import { gameCards, type GameCardItem } from '../gameData'
import type { GamePhase } from '../useGameMachine'

type GameCanvasSceneProps = {
  phase: GamePhase
  activeCardIndex: number
  activeCard: GameCardItem
  className?: string
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void
}

function fitCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = 720 * dpr

  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = false
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number) {
  context.fillStyle = '#000000'
  context.fillRect(0, 0, width, height)
}

// Draw a 1-bit pixel box border at (x, y) with given pixel dimensions
// charW/charH = pixel size of one monospace character cell
function drawBox(
  context: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  charW: number, charH: number,
  fill: string, stroke: string, lineWidth: number,
) {
  context.strokeStyle = stroke
  context.fillStyle = fill
  context.lineWidth = lineWidth

  const cols = Math.floor(w / charW)
  const rows = Math.floor(h / charH)

  if (cols < 2 || rows < 2) return

  // Fill interior
  const innerW = (cols - 2) * charW
  const innerH = (rows - 2) * charH
  context.fillRect(x + charW, y + charH, innerW, innerH)

  // Top and bottom borders
  for (let c = 0; c < cols; c++) {
    const px = x + c * charW
    context.fillRect(px, y, charW, lineWidth)
    context.fillRect(px, y + h - lineWidth, charW, lineWidth)
  }
  // Left and right borders
  for (let r = 0; r < rows; r++) {
    const py = y + r * charH
    context.fillRect(x, py, lineWidth, charH)
    context.fillRect(x + w - lineWidth, py, lineWidth, charH)
  }

  // Corner accents (solid pixel squares)
  const cs = charW * 0.5
  const corners = [
    [x, y],
    [x + w - cs, y],
    [x, y + h - cs],
    [x + w - cs, y + h - cs],
  ]
  for (const [cx, cy] of corners) {
    context.fillRect(cx, cy, cs, cs)
  }
}

function drawTextLine(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size: number) {
  context.fillStyle = color
  context.font = `700 ${size}px monospace`
  context.textBaseline = 'top'
  context.fillText(text, x, y)
}

function drawBoot(context: CanvasRenderingContext2D, width: number, height: number, time: number, charW: number, charH: number) {
  const title = 'ABOUT SCREEN'
  const subtitle = 'LOADING...'
  const barCharCount = 28
  const filled = Math.floor((time / 220) % 4)

  // Title
  const titleWidth = title.length * charW
  drawTextLine(context, title, width / 2 - titleWidth / 2, charH, '#ffffff', 24)

  // Subtitle
  const loadingWidth = subtitle.length * charW
  drawTextLine(context, subtitle, width / 2 - loadingWidth / 2, height * 0.38, '#ffffff', 15)

  // ASCII spinner: cycle through four characters
  const spinnerFrames = ['|', '/', '\u2014', '\\']
  const frame = spinnerFrames[Math.floor((time / 220) % 4)]
  const iconY = height * 0.5 - charH
  drawTextLine(context, frame, width / 2 - charW, iconY, '#ffffff', 28)

  // Progress bar: [#####-----]
  const barBoxW = barCharCount * charW
  const barBoxH = charH
  const barBoxX = width / 2 - barBoxW / 2
  const barBoxY = height * 0.78

  context.fillStyle = '#000000'
  context.fillRect(barBoxX, barBoxY, barBoxW, barBoxH)
  context.fillStyle = '#ffffff'
  context.fillRect(barBoxX, barBoxY, barBoxW, 1)
  context.fillRect(barBoxX, barBoxY + barBoxH - 1, barBoxW, 1)
  context.fillRect(barBoxX, barBoxY, 1, barBoxH)
  context.fillRect(barBoxX + barBoxW - 1, barBoxY, 1, barBoxH)

  const fillW = Math.floor((barCharCount - 2) * (filled / 4))
  context.fillRect(barBoxX + charW, barBoxY + charH * 0.3, fillW * charW, charH * 0.4)

  // Pulsing dots under spinner
  const dots = '\u25CF'.repeat(filled + 1) + '\u25CB'.repeat(3 - filled)
  const dotX = width / 2 - (dots.length * charW * 0.5) / 2
  drawTextLine(context, dots, dotX, height * 0.66, '#ffffff', 12)
}

function drawDesktop(context: CanvasRenderingContext2D, width: number, height: number, activeCardIndex: number, charW: number, charH: number, time: number) {
  const cards = gameCards
  const cardPixelW = 200
  const cardPixelH = 120
  const gap = 14
  const totalW = cards.length * cardPixelW + (cards.length - 1) * gap
  const startX = width / 2 - totalW / 2
  const startY = height * 0.28

  context.textBaseline = 'top'

  cards.forEach((card, index) => {
    const x = startX + index * (cardPixelW + gap)
    const y = startY
    const active = index === activeCardIndex
    const fill = active ? '#ffffff' : '#000000'

    drawBox(context, x, y, cardPixelW, cardPixelH, charW, charH, fill, '#ffffff', 2)

    const textColor = active ? '#000000' : '#ffffff'
    drawTextLine(context, card.shortLabel, x + charW, y + charH, textColor, 12)
    drawTextLine(context, card.label, x + charW, y + cardPixelH - charH * 3, textColor, 15)
    drawTextLine(context, card.title, x + charW, y + cardPixelH - charH * 5, textColor, 20)
  })

  // ASCII pointer sprite
  const arrowY = height * 0.68
  const arrowX = width / 2 - charW * 4
  const arrowLines = [
    '   ^   ',
    '  /|\\  ',
    ' / | \\ ',
  ]
  arrowLines.forEach((line, i) => {
    drawTextLine(context, line, arrowX, arrowY + charH * i * 1.6, '#ffffff', 20)
  })

  // Cursor blinking line
  const blink = Math.floor(time / 500) % 2 === 0
  if (blink) {
    const lineY = arrowY + charH * 5
    context.fillRect(arrowX + charW, lineY, charW * 5, 2)
  }
}

function drawCardPanel(context: CanvasRenderingContext2D, width: number, height: number, card: GameCardItem, charW: number, charH: number) {
  const panelPixelW = Math.min(width * 0.72, 620)
  const panelPixelH = Math.min(height * 0.5, 320)
  const x = width / 2 - panelPixelW / 2
  const y = height / 2 - panelPixelH / 2

  drawBox(context, x, y, panelPixelW, panelPixelH, charW, charH, '#000000', '#ffffff', 2)

  drawTextLine(context, card.label, x + charW * 2, y + charH * 1.5, '#ffffff', 13)
  drawTextLine(context, card.title, x + charW * 2, y + charH * 4, '#ffffff', 34)

  // Body text with word wrap
  context.fillStyle = '#ffffff'
  context.font = `400 16px monospace`
  const maxChars = Math.floor((panelPixelW - charW * 4) / (charW * 0.6))
  const wrapped = wrapText(card.copy, maxChars)
  let cursorY = y + charH * 10
  wrapped.forEach((line) => {
    context.fillText(line, x + charW * 2, cursorY)
    cursorY += charH * 1.8
  })

  drawTextLine(context, '[B] CLOSE', x + charW * 2, y + panelPixelH - charH * 2.5, '#ffffff', 12)
}

function wrapText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    if ((line + ' ' + word).trim().length > maxChars) {
      if (line) lines.push(line.trim())
      line = word
    } else {
      line = (line + ' ' + word).trim()
    }
  }
  if (line) lines.push(line.trim())
  return lines
}

export function GameCanvasScene({ phase, activeCardIndex, activeCard, className, onCanvasReady }: GameCanvasSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const phaseRef = useRef(phase)
  const activeCardIndexRef = useRef(activeCardIndex)
  const activeCardRef = useRef(activeCard)

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex
  }, [activeCardIndex])

  useEffect(() => {
    activeCardRef.current = activeCard
  }, [activeCard])

  useEffect(() => {
    onCanvasReady?.(canvasRef.current)
    return () => {
      onCanvasReady?.(null)
    }
  }, [onCanvasReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let frameId = 0
    let observer: ResizeObserver | null = null

    const getCharMetrics = () => {
      context.font = '700 14px monospace'
      const m = context.measureText('M')
      return { charW: m.width, charH: 18 }
    }

    const render = (time: number) => {
      fitCanvas(canvas, context)
      const size = canvas.width

      context.clearRect(0, 0, size, size)

      // Rotate canvas 90° CW to match mesh orientation
      context.save()
      context.translate(size, 0)
      context.rotate(Math.PI / 2)

      drawBackground(context, size, size)

      const { charW, charH } = getCharMetrics()

      if (phaseRef.current === 'boot') {
        drawBoot(context, size, size, time, charW, charH)
      } else if (phaseRef.current === 'desktop') {
        drawDesktop(context, size, size, activeCardIndexRef.current, charW, charH, time)
      } else {
        drawCardPanel(context, size, size, activeCardRef.current, charW, charH)
      }

      context.restore()

      frameId = window.requestAnimationFrame(render)
    }

    observer = new ResizeObserver(() => {
      // fixed-size canvas, no need to re-fit
    })
    observer.observe(canvas)
    frameId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(frameId)
      observer?.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className ?? 'game-page__canvas'} aria-hidden="true" />
}
