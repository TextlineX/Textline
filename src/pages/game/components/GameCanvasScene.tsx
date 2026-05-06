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
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const width = Math.max(1, Math.round(rect.width * dpr))
  const height = Math.max(1, Math.round(rect.height * dpr))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }

  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.imageSmoothingEnabled = false
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r)
  context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r)
  context.arcTo(x, y, x + width, y, r)
  context.closePath()
}

function drawBackground(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  const background = context.createLinearGradient(0, 0, 0, height)
  background.addColorStop(0, '#05050a')
  background.addColorStop(0.58, '#0d1118')
  background.addColorStop(1, '#131823')
  context.fillStyle = background
  context.fillRect(0, 0, width, height)

  const glow = context.createRadialGradient(width * 0.5, height * 0.18, 20, width * 0.5, height * 0.18, Math.max(width, height) * 0.88)
  glow.addColorStop(0, 'rgba(77,221,255,0.28)')
  glow.addColorStop(0.45, 'rgba(255,84,170,0.08)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = glow
  context.fillRect(0, 0, width, height)

  context.save()
  context.globalAlpha = 0.14
  context.strokeStyle = '#4dddfd'
  context.lineWidth = 1
  const step = 30
  const offsetX = Math.sin(time * 0.0002) * 10
  const offsetY = Math.cos(time * 0.00017) * 10
  for (let x = -step; x < width + step; x += step) {
    context.beginPath()
    context.moveTo(x + offsetX, 0)
    context.lineTo(x + offsetX, height)
    context.stroke()
  }
  for (let y = -step; y < height + step; y += step) {
    context.beginPath()
    context.moveTo(0, y + offsetY)
    context.lineTo(width, y + offsetY)
    context.stroke()
  }
  context.restore()
}

function drawBoot(context: CanvasRenderingContext2D, width: number, height: number, time: number) {
  context.fillStyle = '#f1ede6'
  context.font = '700 15px monospace'
  context.textAlign = 'center'
  context.fillText('LOADING...', width / 2, height * 0.16)

  const iconSize = Math.min(width, height) * 0.17
  const x = width / 2 - iconSize / 2
  const y = height / 2 - iconSize / 2
  context.fillStyle = 'rgba(255,255,255,0.04)'
  roundedRect(context, x, y, iconSize, iconSize, 10)
  context.fill()
  context.strokeStyle = 'rgba(241,237,230,0.22)'
  context.stroke()

  const step = Math.floor((time / 220) % 4)
  context.save()
  context.translate(width / 2, height / 2)
  context.rotate((Math.PI / 2) * step)
  context.fillStyle = '#f1ede6'
  context.fillRect(-iconSize * 0.18, -iconSize * 0.18, iconSize * 0.36, iconSize * 0.36)
  context.restore()

  const barWidth = width * 0.82
  const barHeight = 12
  const barX = (width - barWidth) / 2
  const barY = height * 0.84
  context.strokeStyle = 'rgba(241,237,230,0.2)'
  context.strokeRect(barX, barY, barWidth, barHeight)
  context.fillStyle = '#f1ede6'
  context.fillRect(barX + 1, barY + 1, Math.max(0, barWidth * 0.42), barHeight - 2)

  context.fillStyle = '#f1ede6'
  context.font = '700 24px monospace'
  context.fillText('ABOUT SCREEN', width / 2, height * 0.06)
}

function drawDesktop(context: CanvasRenderingContext2D, width: number, height: number, activeCardIndex: number) {
  const cards = gameCards
  const gridWidth = Math.min(width * 0.88, 960)
  const cardWidth = (gridWidth - 3 * 14) / 4
  const cardHeight = Math.max(cardWidth * 1.08, 126)
  const startX = (width - gridWidth) / 2
  const startY = height * 0.28

  context.textBaseline = 'top'
  cards.forEach((card, index) => {
    const x = startX + index * (cardWidth + 14)
    const y = startY
    const active = index === activeCardIndex
    context.save()
    context.fillStyle = active ? 'rgba(77,221,255,0.92)' : 'rgba(255,255,255,0.04)'
    roundedRect(context, x, y, cardWidth, cardHeight, 18)
    context.fill()
    context.strokeStyle = active ? 'rgba(255,255,255,0.22)' : 'rgba(77,221,255,0.16)'
    context.stroke()
    context.fillStyle = active ? '#081018' : '#f1ede6'
    context.font = '700 15px monospace'
    context.fillText(card.shortLabel, x + 16, y + 14)
    context.font = '700 20px monospace'
    context.fillText(card.label, x + 16, y + cardHeight - 44)
    context.fillStyle = active ? 'rgba(8,16,24,0.72)' : 'rgba(241,237,230,0.52)'
    context.font = '600 12px monospace'
    context.fillText(card.title, x + 16, y + cardHeight - 68)
    context.restore()
  })

  const spriteSize = 68
  const spriteX = width / 2 - spriteSize / 2
  const spriteY = height * 0.68
  context.save()
  context.fillStyle = '#f1ede6'
  context.beginPath()
  context.moveTo(spriteX + spriteSize / 2, spriteY)
  context.lineTo(spriteX + spriteSize * 0.82, spriteY + spriteSize * 0.18)
  context.lineTo(spriteX + spriteSize, spriteY + spriteSize * 0.45)
  context.lineTo(spriteX + spriteSize * 0.78, spriteY + spriteSize)
  context.lineTo(spriteX + spriteSize / 2, spriteY + spriteSize * 0.82)
  context.lineTo(spriteX + spriteSize * 0.22, spriteY + spriteSize)
  context.lineTo(spriteX, spriteY + spriteSize * 0.45)
  context.lineTo(spriteX + spriteSize * 0.18, spriteY + spriteSize * 0.18)
  context.closePath()
  context.fill()
  context.restore()
}

function drawCardPanel(context: CanvasRenderingContext2D, width: number, height: number, card: GameCardItem) {
  const panelWidth = Math.min(width * 0.72, 620)
  const panelHeight = Math.min(height * 0.5, 320)
  const x = (width - panelWidth) / 2
  const y = (height - panelHeight) / 2

  context.save()
  context.fillStyle = 'rgba(10,10,12,0.96)'
  roundedRect(context, x, y, panelWidth, panelHeight, 18)
  context.fill()
  context.strokeStyle = 'rgba(77,221,255,0.24)'
  context.stroke()

  context.fillStyle = 'rgba(77,221,255,0.72)'
  context.font = '700 13px monospace'
  context.fillText(card.label, x + 20, y + 20)

  context.fillStyle = '#f1ede6'
  context.font = '700 34px monospace'
  context.fillText(card.title, x + 20, y + 56)

  context.fillStyle = 'rgba(241,237,230,0.84)'
  context.font = '400 16px sans-serif'
  const lines = [card.copy]
  let cursorY = y + 108
  lines.forEach((line) => {
    context.fillText(line, x + 20, cursorY)
    cursorY += 24
  })

  context.fillStyle = 'rgba(77,221,255,0.72)'
  context.font = '700 12px monospace'
  context.fillText('[B] TO CLOSE', x + 20, y + panelHeight - 34)
  context.restore()
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
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    let frameId = 0
    let observer: ResizeObserver | null = null
    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, rect.width)
      const height = Math.max(1, rect.height)

      fitCanvas(canvas, context)
      context.clearRect(0, 0, width, height)
      drawBackground(context, width, height, time)

      if (phaseRef.current === 'boot') {
        drawBoot(context, width, height, time)
      } else if (phaseRef.current === 'desktop') {
        drawDesktop(context, width, height, activeCardIndexRef.current)
      } else {
        drawCardPanel(context, width, height, activeCardRef.current)
      }

      frameId = window.requestAnimationFrame(render)
    }

    observer = new ResizeObserver(() => {
      fitCanvas(canvas, context)
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
