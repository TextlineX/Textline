import { useMemo } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { heroConfig } from '../../data/heroConfig'
import { useSphereInteraction } from '../../hooks/hero/useSphereInteraction'
import { useViewportSize } from '../../hooks/useViewportSize'
import { ThreeSphereScene } from '../../effects/hero/ThreeSphereScene'
import './CharacterSphere.less'

export function CharacterSphere() {
  const viewport = useViewportSize()
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

  return (
    <div className="character-sphere" aria-label="character sphere">
      <div
        className="character-sphere__scene"
        onPointerMove={(event) => {
          setCursor({ x: event.clientX, y: event.clientY })
        }}
      >
        <ThreeSphereScene
          scrollPhysicsDirection={scrollPhysicsDirection}
          scrollPhysicsPulseId={scrollPhysicsPulseId}
          scrollPhysicsStrength={scrollPhysicsStrength}
        />
      </div>
    </div>
  )
}
