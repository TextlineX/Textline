import { type CSSProperties, useEffect, useMemo, useRef } from 'react'

import './CodeTunnel.less'

type RingTone = 'base' | 'accent' | 'muted' | 'strong'

const codeRows = [
  "import { tunnel } from '@/runtime/works'",
  "const depth = lerp(camera.z, target.z, 0.08)",
  "projects.push({ id: 'chaoxing-ai', stack: ['Go', 'OCR', 'RPA'] })",
  "if (section === 'works') engage('code-wormhole')",
  "signal = scroll.sample(delta).clamp(0, 1)",
  "await deploy('textline', { edge: 'cloudflare', mode: 'stable' })",
  "const palette = ['ember', 'graphite', 'cyan']",
  "renderFrame({ crt: true, bloom: false, grain: 0.04 })",
  "timeline.add(syncPerspective(pointer, viewport))",
  "git commit -m 'feat(works): build wormhole tunnel'",
  "const nodes = skills.map((item) => ({ id: item.label, mass: 1 }))",
  "pointer.lock(target).release(sectionProgress > 0.82)",
  "shader.uniforms.depth.value = viewport.height * 0.32",
  "const shell = createTerminal({ theme: 'ember-abyss' })",
  "queue.push({ job: 'capture', channel: 'visual', priority: 3 })",
  "const route = ['hero', 'about', 'skills', 'works']",
  "engine.impulse(layer, { x: 0.12, y: -0.08, z: 0.4 })",
  "return scene.compose({ ink: true, halftone: false })",
]

const tonePattern: RingTone[] = ['strong', 'base', 'muted', 'accent', 'base', 'muted']

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

type CodeTunnelProps = {
  engaged?: boolean
  revealProgress?: number
  motionImpulse?: number
}

export function CodeTunnel({ engaged = false, revealProgress = 0, motionImpulse = 0 }: CodeTunnelProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const engagedRef = useRef(false)

  const rings = useMemo(() => {
    return Array.from({ length: 15 }, (_, ringIndex) => {
      const segmentCount = 12 + (ringIndex % 4)
      const angleStep = 360 / segmentCount
      const spinDirection = ringIndex % 2 === 0 ? 1 : -1

      const segments = Array.from({ length: segmentCount }, (_, segmentIndex) => {
        const rowIndex = (ringIndex * 2 + segmentIndex) % codeRows.length

        return {
          id: `${ringIndex}-${segmentIndex}`,
          tone: tonePattern[(ringIndex + segmentIndex) % tonePattern.length],
          text: codeRows[rowIndex],
          style: {
            '--segment-angle': `${segmentIndex * angleStep}deg`,
            '--segment-width': `${8.3 + ((ringIndex + segmentIndex) % 3) * 1.35}rem`,
          } as CSSProperties,
        }
      })

      return {
        id: `code-wormhole-ring-${ringIndex}`,
        segments,
        style: {
          '--ring-delay': `${ringIndex * -0.64}s`,
          '--ring-depth-start': `${-5200 + ringIndex * 360}px`,
          '--ring-depth-end': `${1240 + ringIndex * 34}px`,
          '--ring-spin-start': `${spinDirection * (14 + ringIndex * 13)}deg`,
          '--ring-spin-end': `${spinDirection * (104 + ringIndex * 21)}deg`,
          '--ring-opacity-peak': `${0.26 + ringIndex * 0.03}`,
          '--ring-halo-opacity': `${0.18 + ringIndex * 0.022}`,
        } as CSSProperties,
      }
    })
  }, [engaged])

  useEffect(() => {
    engagedRef.current = engaged

    if (!engaged && rootRef.current) {
      rootRef.current.style.setProperty('--tunnel-origin-x', '50%')
      rootRef.current.style.setProperty('--tunnel-origin-y', '50%')
      rootRef.current.style.setProperty('--tunnel-tilt-x', '0deg')
      rootRef.current.style.setProperty('--tunnel-tilt-y', '0deg')
    }
  }, [engaged])

  useEffect(() => {
    if (!rootRef.current) {
      return
    }

    rootRef.current.style.setProperty('--tunnel-reveal-progress', revealProgress.toFixed(3))
    rootRef.current.style.setProperty('--tunnel-motion-impulse', motionImpulse.toFixed(3))
  }, [motionImpulse, revealProgress])

  useEffect(() => {
    const root = rootRef.current

    if (!root || !engaged) {
      return
    }

    let frameId = 0

    const current = { originX: 50, originY: 50, tiltX: 0, tiltY: 0 }
    const target = { originX: 50, originY: 50, tiltX: 0, tiltY: 0 }

    const writeVars = () => {
      current.originX += (target.originX - current.originX) * 0.08
      current.originY += (target.originY - current.originY) * 0.08
      current.tiltX += (target.tiltX - current.tiltX) * 0.08
      current.tiltY += (target.tiltY - current.tiltY) * 0.08

      root.style.setProperty('--tunnel-origin-x', `${current.originX}%`)
      root.style.setProperty('--tunnel-origin-y', `${current.originY}%`)
      root.style.setProperty('--tunnel-tilt-x', `${current.tiltX}deg`)
      root.style.setProperty('--tunnel-tilt-y', `${current.tiltY}deg`)

      frameId = window.requestAnimationFrame(writeVars)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!engagedRef.current) {
        return
      }

      const rect = root.getBoundingClientRect()
      const normalizedX = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const normalizedY = clamp((event.clientY - rect.top) / rect.height, 0, 1)

      target.originX = 32 + normalizedX * 36
      target.originY = 30 + normalizedY * 38
      target.tiltY = (normalizedX - 0.5) * 9
      target.tiltX = (0.5 - normalizedY) * 8
    }

    const handlePointerLeave = () => {
      target.originX = 50
      target.originY = 50
      target.tiltX = 0
      target.tiltY = 0
    }

    root.addEventListener('pointermove', handlePointerMove)
    root.addEventListener('pointerleave', handlePointerLeave)
    frameId = window.requestAnimationFrame(writeVars)

    return () => {
      window.cancelAnimationFrame(frameId)
      root.removeEventListener('pointermove', handlePointerMove)
      root.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <div ref={rootRef} className={`code-tunnel${engaged ? ' code-tunnel--engaged' : ''}`} aria-hidden="true">
      <div className="code-tunnel__depth">
        {rings.map((ring) => (
          <div key={ring.id} className="code-tunnel__ring" style={ring.style}>
            <div className="code-tunnel__ring-shell" />

            <div className="code-tunnel__ring-segments">
              {ring.segments.map((segment) => (
                <div key={segment.id} className="code-tunnel__segment-anchor" style={segment.style}>
                  <div className={`code-tunnel__segment code-tunnel__segment--${segment.tone}`}>
                    <span className="code-tunnel__prompt">&gt;</span>
                    <span className="code-tunnel__text">{segment.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="code-tunnel__vignette" />
      <div className="code-tunnel__aperture">
        <span className="code-tunnel__aperture-halo" />
        <span className="code-tunnel__aperture-core" />
      </div>
    </div>
  )
}
