import { useEffect, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { useViewportSize } from '../../hooks/useViewportSize'
import type { SkillCloudItem } from '../../data/skillsCloudData'
import { skillsIconMap } from '../../data/skillsIconMap'

import './PhysicsSkillCloud.less'

type PhysicsSkillCloudProps = {
  items: SkillCloudItem[]
  limit?: number
  sectionIndex: number
}

type MatterBody = {
  angle: number
  angularVelocity: number
  position: {
    x: number
    y: number
  }
  velocity: {
    x: number
    y: number
  }
}

type MatterEngine = {
  world: unknown
}

type MatterModule = {
  Body: {
    applyForce: (body: MatterBody, position: { x: number; y: number }, force: { x: number; y: number }) => void
    setAngularVelocity: (body: MatterBody, velocity: number) => void
    setPosition: (body: MatterBody, position: { x: number; y: number }) => void
    setVelocity: (body: MatterBody, velocity: { x: number; y: number }) => void
  }
  Bodies: {
    circle: (x: number, y: number, radius: number, options?: Record<string, unknown>) => MatterBody
    rectangle: (x: number, y: number, width: number, height: number, options?: Record<string, unknown>) => MatterBody
  }
  Composite: {
    clear: (world: unknown, keepStatic?: boolean, deep?: boolean) => void
  }
  Engine: {
    clear: (engine: MatterEngine) => void
    create: (options?: Record<string, unknown>) => MatterEngine
    update: (engine: MatterEngine, delta?: number) => void
  }
  World: {
    add: (world: unknown, bodies: unknown[]) => void
  }
}

type ChipBody = MatterBody & {
  isStatic?: boolean
}

type ChipEntry = {
  body: ChipBody
  size: number
}

type BurstOptions = {
  direction: number
  emphasis?: number
  strength: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function resolveMatterModule(module: unknown) {
  const candidate = module as MatterModule & { default?: MatterModule }
  return (candidate.default ?? candidate) as MatterModule
}

function resolveChipSize(item: SkillCloudItem) {
  const weight = item.weight ?? 1
  return weight >= 3 ? 104 : weight === 2 ? 94 : 86
}

function resolveSkillMark(label: string) {
  const parts = label
    .replace(/[^a-zA-Z0-9+.#]/g, ' ')
    .split(' ')
    .filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
  }

  return label.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase()
}

function resolveStackSlots(stageWidth: number, stageHeight: number, cellSize: number, count: number) {
  const cols = Math.max(3, Math.min(5, Math.ceil(Math.sqrt(count + 2))))
  const gap = clamp(cellSize * 0.18, 12, 18)
  const step = cellSize + gap
  const rows = Math.max(1, Math.ceil(count / cols))
  const stackWidth = cols * cellSize + (cols - 1) * gap
  const startX = (stageWidth - stackWidth) / 2 + cellSize / 2
  const floorMargin = clamp(stageHeight * 0.08, 44, 68)
  const bottomY = stageHeight - floorMargin - cellSize / 2
  const slots: Array<{ x: number; y: number }> = []

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = startX + col * step
      const y = bottomY - row * step
      slots.push({ x, y })
    }
  }

  return slots
}

export function PhysicsSkillCloud({ items, limit = 14, sectionIndex }: PhysicsSkillCloudProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const chipRefs = useRef<Array<HTMLDivElement | null>>([])
  const burstRef = useRef<((options: BurstOptions) => void) | null>(null)
  const { activeIndex, scrollOffset, scrollPhysicsDirection, scrollPhysicsPulseId, scrollPhysicsStrength } = useAppShellScroll()
  const viewport = useViewportSize()
  const [isRunning, setIsRunning] = useState(false)

  const visibleLimit = viewport.width <= 720 ? Math.min(limit, 9) : viewport.width <= 1100 ? Math.min(limit, 13) : limit
  const visibleItems = items.slice(0, visibleLimit)
  const itemSignature = visibleItems.map((item) => item.label).join('|')

  useEffect(() => {
    const sectionProgress = viewport.height > 0 ? scrollOffset / viewport.height - sectionIndex : 0
    const nextRunning = sectionProgress >= -2.15 && sectionProgress <= 1.05
    setIsRunning((current) => (current === nextRunning ? current : nextRunning))
  }, [scrollOffset, sectionIndex, viewport.height])

  useEffect(() => {
    const stage = stageRef.current
    const activeItems = items.slice(0, visibleLimit)
    if (!stage || activeItems.length === 0 || !isRunning) {
      return
    }

    let disposed = false
    let frameId = 0
    let engine: MatterEngine | null = null
    let matter: MatterModule | null = null
    let chipEntries: ChipEntry[] = []

    const boot = async () => {
      const importedMatter = await import('matter-js')
      const Matter = resolveMatterModule(importedMatter)

      if (disposed) {
        return
      }

      matter = Matter
      engine = Matter.Engine.create({
        gravity: { x: 0, y: 1, scale: 0.00145 },
      })

      const { width, height } = stage.getBoundingClientRect()
      const stageWidth = Math.max(320, width)
      const stageHeight = Math.max(420, height)
      const centerX = stageWidth / 2
      const wallThickness = 180
      const stackCellSize = viewport.width <= 900 ? 104 : 118
      const stackSlots = resolveStackSlots(stageWidth, stageHeight, stackCellSize, activeItems.length)

      const walls = [
        Matter.Bodies.rectangle(stageWidth / 2, -wallThickness / 2, stageWidth + wallThickness * 2, wallThickness, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(stageWidth / 2, stageHeight + wallThickness / 2, stageWidth + wallThickness * 2, wallThickness, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(-wallThickness / 2, stageHeight / 2, wallThickness, stageHeight + wallThickness * 2, {
          isStatic: true,
        }),
        Matter.Bodies.rectangle(stageWidth + wallThickness / 2, stageHeight / 2, wallThickness, stageHeight + wallThickness * 2, {
          isStatic: true,
        }),
      ]

      chipEntries = activeItems.map((item, index) => {
        const slot = stackSlots[index] ?? stackSlots[stackSlots.length - 1] ?? { x: centerX, y: stageHeight / 2 }
        const chipSize = resolveChipSize(item)
        const spawnX = slot.x + randomBetween(-chipSize * 0.28, chipSize * 0.28)
        const spawnY = slot.y + randomBetween(-chipSize * 0.2, chipSize * 0.2)
        const body = Matter.Bodies.rectangle(slot.x, slot.y, chipSize, chipSize, {
          chamfer: { radius: 14 },
          friction: 0.015,
          frictionAir: 0.006,
          restitution: 0.2,
          slop: 0.02,
        })

        Matter.Body.setPosition(body, { x: spawnX, y: spawnY })
        Matter.Body.setVelocity(body, {
          x: randomBetween(-1.05, 1.05),
          y: randomBetween(-0.68, 0.38),
        })
        Matter.Body.setAngularVelocity(body, randomBetween(-0.12, 0.12))

        return {
          body,
          size: chipSize,
        }
      })

      Matter.World.add(engine.world, [...walls, ...chipEntries.map((entry) => entry.body)])

      burstRef.current = ({ direction, emphasis = 1, strength }) => {
        const burstStrength = clamp(0.00044 + strength * 0.0028, 0.00046, 0.00105) * emphasis

        chipEntries.forEach((entry) => {
          Matter.Body.applyForce(entry.body, entry.body.position, {
            x: direction * burstStrength * randomBetween(0.8, 1.28) + randomBetween(-0.16, 0.16) * burstStrength,
            y: -burstStrength * randomBetween(0.45, 1.2),
          })
          Matter.Body.setAngularVelocity(entry.body, entry.body.angularVelocity + randomBetween(-0.045, 0.045) * emphasis)
        })
      }

      const tick = () => {
        if (disposed || !engine || !matter) {
          return
        }

        const Matter = matter
        const time = performance.now() * 0.001

        chipEntries.forEach((entry, index) => {
          const wobble = 0.000016 + index * 0.0000012
          Matter.Body.applyForce(entry.body, entry.body.position, {
            x: Math.sin(time * 1.15 + index * 0.85) * wobble,
            y: Math.cos(time * 0.92 + index * 0.7) * wobble * 0.72,
          })
        })

        Matter.Engine.update(engine, 1000 / 60)

        chipEntries.forEach((entry, index) => {
          const node = chipRefs.current[index]
          if (!node) {
            return
          }

          node.style.width = `${entry.size}px`
          node.style.height = `${entry.size}px`
          node.style.transform = `translate3d(${entry.body.position.x - entry.size / 2}px, ${entry.body.position.y - entry.size / 2}px, 0) rotate(${entry.body.angle}rad)`
        })

        frameId = window.requestAnimationFrame(tick)
      }

      frameId = window.requestAnimationFrame(tick)
    }

    void boot()

    return () => {
      disposed = true
      window.cancelAnimationFrame(frameId)
      burstRef.current = null
      chipRefs.current = []

      if (matter && engine) {
        matter.Composite.clear(engine.world, false, true)
        matter.Engine.clear(engine)
      }
    }
  }, [itemSignature, items, isRunning, viewport.height, viewport.width, visibleLimit])

  useEffect(() => {
    if (!burstRef.current) {
      return
    }

    if (activeIndex !== sectionIndex && activeIndex !== sectionIndex - 1) {
      return
    }

    burstRef.current({
      direction: scrollPhysicsDirection,
      emphasis: activeIndex === sectionIndex ? 1 : 0.76,
      strength: scrollPhysicsStrength,
    })
  }, [activeIndex, scrollPhysicsDirection, scrollPhysicsPulseId, scrollPhysicsStrength, sectionIndex])

  return (
    <div ref={stageRef} className="physics-skill-cloud">
      <div className="physics-skill-cloud__field" aria-hidden="true">
        {visibleItems.map((item, index) => {
          const icon = item.icon ? skillsIconMap[item.icon] : undefined

          return (
            <div
              key={item.label}
              ref={(node) => {
                chipRefs.current[index] = node
              }}
              className={[
                'physics-skill-cloud__chip',
                `physics-skill-cloud__chip--${item.group}`,
                'magnetic-target',
              ].join(' ')}
              data-magnetic-shell="compact"
            >
              <span className="physics-skill-cloud__chip-icon" aria-hidden="true">
                {icon?.path ? (
                  <svg viewBox={icon.viewBox ?? '0 0 24 24'} focusable="false">
                    <path d={icon.path} fill="currentColor" />
                  </svg>
                ) : (
                  <span className="physics-skill-cloud__chip-mark">{icon?.mark ?? resolveSkillMark(item.label)}</span>
                )}
              </span>
              <span className="physics-skill-cloud__chip-label">{item.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
