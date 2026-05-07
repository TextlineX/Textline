import { useEffect, useMemo, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { heroConfig } from '../../data/heroConfig'
import { useSphereInteraction } from '../../hooks/hero/useSphereInteraction'
import { useViewportSize } from '../../hooks/useViewportSize'
import { ThreeSphereScene } from '../../effects/hero/ThreeSphereScene'
import './CharacterSphere.less'

export function CharacterSphere() {
  const viewport = useViewportSize()
  const sceneShellRef = useRef<HTMLDivElement | null>(null)
  const [isWarmed, setIsWarmed] = useState(true)
  const {
    scrollPhysicsDirection,
    scrollPhysicsPulseId,
    scrollPhysicsStrength,
  } = useAppShellScroll()

  const { setCursor } = useSphereInteraction({
    center: useMemo(
      () => ({
        x: viewport.width / 2,
        y: viewport.height / 2,
      }),
      [viewport.height, viewport.width],
    ),
    radius: Math.min(viewport.width, viewport.height) * heroConfig.sphereRadiusRatio,
    lockRadius: Math.min(viewport.width, viewport.height) * heroConfig.magneticRadiusRatio,
  })

  useEffect(() => {
    const sceneShell = sceneShellRef.current
    if (!sceneShell || typeof IntersectionObserver === 'undefined') {
      setIsWarmed(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsWarmed(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: '140% 0px 180% 0px',
        threshold: 0.01,
      },
    )

    observer.observe(sceneShell)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="character-sphere" aria-label="character sphere">
      <div
        ref={sceneShellRef}
        className="character-sphere__scene"
        onPointerMove={(event) => {
          setCursor({ x: event.clientX, y: event.clientY })
        }}
      >
        <ThreeSphereScene
          enabled={isWarmed}
          scrollPhysicsDirection={scrollPhysicsDirection}
          scrollPhysicsPulseId={scrollPhysicsPulseId}
          scrollPhysicsStrength={scrollPhysicsStrength}
        />
      </div>
    </div>
  )
}
