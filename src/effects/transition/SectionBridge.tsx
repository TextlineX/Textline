import { type CSSProperties, type PropsWithChildren, useMemo } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { sectionBridgeConfigById, type SectionBridgeConfig, type SectionBridgePhaseConfig } from '../../data/sectionBridgeConfig'
import './SectionBridge.less'

type SectionBridgeProps = PropsWithChildren<{
  sectionId: string
  sectionIndex: number
  className?: string
}>

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0
  }

  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}

function easeOutCubic(value: number) {
  const x = clamp(value, 0, 1)
  return 1 - Math.pow(1 - x, 3)
}

function easeInCubic(value: number) {
  const x = clamp(value, 0, 1)
  return x * x * x
}

function resolvePhase(fallback: SectionBridgePhaseConfig, phase?: Partial<SectionBridgePhaseConfig>) {
  return {
    overlapVh: phase?.overlapVh ?? fallback.overlapVh,
    liftVh: phase?.liftVh ?? fallback.liftVh,
    opacityFrom: phase?.opacityFrom ?? fallback.opacityFrom,
    opacityTo: phase?.opacityTo ?? fallback.opacityTo,
  }
}

function resolveBridgeConfig(config?: SectionBridgeConfig) {
  return {
    enter: resolvePhase({
      overlapVh: 0.16,
      liftVh: 0.54,
      opacityFrom: 0.8,
      opacityTo: 1,
    }, config?.enter),
    exit: resolvePhase({
      overlapVh: 0.24,
      liftVh: 0.82,
      opacityFrom: 1,
      opacityTo: 0.12,
    }, config?.exit),
    prev: config?.prev,
    next: config?.next,
  }
}

export function SectionBridge({ children, className, sectionId, sectionIndex }: SectionBridgeProps) {
  const { scrollOffset, viewportHeight, activeIndex } = useAppShellScroll()

  const bridge = useMemo(() => resolveBridgeConfig(sectionBridgeConfigById[sectionId]), [sectionId])

  const sectionProgress = viewportHeight > 0 ? scrollOffset / viewportHeight - sectionIndex : 0
  const enterProgress = smoothstep(-1, 0, sectionProgress)
  const exitProgress = smoothstep(0, 1, sectionProgress)

  const enterLift = viewportHeight * bridge.enter.liftVh * (1 - easeOutCubic(enterProgress))
  const exitPush = -viewportHeight * bridge.exit.liftVh * easeInCubic(exitProgress)
  const transformY = enterLift + exitPush

  const enterOpacity = clamp(
    bridge.enter.opacityFrom + (bridge.enter.opacityTo - bridge.enter.opacityFrom) * easeOutCubic(enterProgress),
    0,
    1,
  )
  const exitOpacity = clamp(
    bridge.exit.opacityFrom + (bridge.exit.opacityTo - bridge.exit.opacityFrom) * easeOutCubic(exitProgress),
    0,
    1,
  )
  const opacity = clamp(enterOpacity * exitOpacity, 0, 1)

  const activeDistance = Math.abs(activeIndex - sectionIndex)
  const zIndex = activeDistance === 0 ? 4 : activeDistance === 1 ? 3 : 1

  return (
    <div
      className={['section-bridge', className].filter(Boolean).join(' ')}
      data-section-id={sectionId}
      data-section-prev={bridge.prev ?? ''}
      data-section-next={bridge.next ?? ''}
      style={
        {
          transform: `translate3d(0, ${transformY}px, 0)`,
          opacity,
          pointerEvents: 'auto',
          zIndex,
          '--section-bridge-progress': String(clamp(sectionProgress + 1, 0, 2)),
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
