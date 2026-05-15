import { Children, type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { CornerIcon } from '../../effects/CornerIcon'
import { LogoMark } from '../shared/LogoMark'
import { SideDrawer } from '../shared/SideDrawer'
import { navItems } from '../../data/siteData'
import { useBootContext } from './BootContext'
import { useCooldownGate } from '../../hooks/useCooldownGate'
import { useMagneticCursor } from '../../hooks/cursor/useMagneticCursor'
import { useViewportSize } from '../../hooks/useViewportSize'
import { useViewportVars } from '../../hooks/useViewportVars'
import { MagneticCursor } from '../../effects/cursor/MagneticCursor'
import { AppShellScrollProvider } from './AppShellScroll'
import { SectionBridge } from '../../effects/transition/SectionBridge'
import './AppShell.less'

type AppShellProps = PropsWithChildren

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

const sectionStrideFactor = 1.8

export function AppShell({ children }: AppShellProps) {
  const { interactiveReady } = useBootContext()
  const viewport = useViewportSize()
  useViewportVars({ width: viewport.width, height: viewport.height })
  const sections = useMemo(() => Children.toArray(children), [children])
  const { position, locked, size, mode } = useMagneticCursor({ enabled: interactiveReady })
  const [currentOffset, setCurrentOffset] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrollPhysicsDirection, setScrollPhysicsDirection] = useState(1)
  const [scrollPhysicsStrength, setScrollPhysicsStrength] = useState(0)
  const [scrollDirection, setScrollDirection] = useState<1 | -1>(1)
  const [playgroundRevealProgress, setPlaygroundRevealProgress] = useState(0)
  const [experienceRevealProgress, setExperienceRevealProgress] = useState(0)
  const [worksRevealProgress, setWorksRevealProgress] = useState(0)
  const [worksScrollImpulse, setWorksScrollImpulse] = useState(0)
  const playgroundRevealProgressRef = useRef(0)
  const experienceRevealProgressRef = useRef(0)
  const worksRevealProgressRef = useRef(0)
  const worksScrollImpulseRef = useRef(0)
  const activeIndexRef = useRef(0)
  const playgroundRecedeFrameRef = useRef<number | undefined>(undefined)
  const worksRecedeFrameRef = useRef<number | undefined>(undefined)
  const targetOffsetRef = useRef(0)
  const currentOffsetRef = useRef(0)
  const publishedOffsetRef = useRef(0)
  const publishedWorksScrollImpulseRef = useRef(0)
  const publishAtRef = useRef(0)
  const frameRef = useRef<number | undefined>(undefined)
  const {
    ready: scrollPhysicsReady,
    pulseId: scrollPhysicsPulseId,
    arm: armScrollPhysics,
    touch: touchScrollPhysics,
    reset: resetScrollPhysics,
  } = useCooldownGate({ delayMs: 180 })

  const sectionStep = Math.max(1, viewport.height * sectionStrideFactor)
  const maxOffset = Math.max(0, (sections.length - 1) * sectionStep)

  const clampOffset = useCallback(
    (value: number) => {
      return Math.max(0, Math.min(maxOffset, value))
    },
    [maxOffset],
  )

  useEffect(() => {
    targetOffsetRef.current = clampOffset(targetOffsetRef.current)
    currentOffsetRef.current = clampOffset(currentOffsetRef.current)
    setCurrentOffset(currentOffsetRef.current)
  }, [clampOffset])

  const activeIndex = useMemo(() => {
    if (sections.length <= 0 || viewport.height <= 0) {
      return 0
    }

    const nextIndex = Math.round(currentOffset / sectionStep)
    return Math.max(0, Math.min(navItems.length - 1, nextIndex))
  }, [currentOffset, sectionStep, sections.length])

  const scrollProgress = useMemo(() => {
    if (maxOffset <= 0) {
      return 0
    }

    return Math.max(0, Math.min(1, currentOffset / maxOffset))
  }, [currentOffset, maxOffset])

  useEffect(() => {
    document.documentElement.style.setProperty('--active-section-index', String(activeIndex))
  }, [activeIndex])

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const snapToOffset = useCallback(
    (value: number) => {
      const next = clampOffset(value)
      targetOffsetRef.current = next
      currentOffsetRef.current = next
      publishedOffsetRef.current = next
      publishAtRef.current = performance.now()
      document.documentElement.style.setProperty('--app-scroll-offset', `${next}px`)
      setCurrentOffset(next)
    },
    [clampOffset],
  )

  const requestHome = useCallback(() => {
    targetOffsetRef.current = 0
    setMenuOpen(false)
    resetScrollPhysics()
    setScrollPhysicsDirection(1)
    setScrollPhysicsStrength(0.42)
    armScrollPhysics()
  }, [armScrollPhysics, resetScrollPhysics])

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--app-scroll-offset')
      document.documentElement.style.removeProperty('--app-scroll-progress')
      document.documentElement.style.removeProperty('--section-step')
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--section-step', `${sectionStep}px`)

    return () => {
      document.documentElement.style.removeProperty('--section-step')
    }
  }, [sectionStep])

  useEffect(() => {
    document.documentElement.dataset.menuOpen = menuOpen ? 'true' : 'false'
    return () => {
      delete document.documentElement.dataset.menuOpen
    }
  }, [menuOpen])

  useEffect(() => {
    if (activeIndex !== 5 && playgroundRevealProgress !== 0) {
      if (playgroundRecedeFrameRef.current !== undefined) {
        window.cancelAnimationFrame(playgroundRecedeFrameRef.current)
      }

      const startProgress = playgroundRevealProgressRef.current
      const startTime = performance.now()
      const duration = 320

      const tick = (time: number) => {
        const elapsed = time - startTime
        const progress = clamp(1 - elapsed / duration, 0, 1)
        const eased = progress * progress * (3 - 2 * progress)
        const nextProgress = startProgress * eased

        setPlaygroundRevealProgress(nextProgress)

        if (nextProgress > 0.001 && activeIndexRef.current !== 5) {
          playgroundRecedeFrameRef.current = window.requestAnimationFrame(tick)
          return
        }

        playgroundRecedeFrameRef.current = undefined
        setPlaygroundRevealProgress(0)
      }

      playgroundRecedeFrameRef.current = window.requestAnimationFrame(tick)
      return
    }
  }, [activeIndex, playgroundRevealProgress])

  useEffect(() => {
    playgroundRevealProgressRef.current = playgroundRevealProgress
  }, [playgroundRevealProgress])

  useEffect(() => {
    experienceRevealProgressRef.current = experienceRevealProgress
  }, [experienceRevealProgress])

  useEffect(() => {
    if (activeIndex !== 4 && experienceRevealProgress !== 0) {
      setExperienceRevealProgress(0)
    }
  }, [activeIndex, experienceRevealProgress])

  useEffect(() => {
    if (activeIndex !== 3 && worksRevealProgress !== 0) {
      if (worksRecedeFrameRef.current !== undefined) {
        window.cancelAnimationFrame(worksRecedeFrameRef.current)
      }

      const startProgress = worksRevealProgressRef.current
      const startTime = performance.now()
      const duration = 280

      const tick = (time: number) => {
        const elapsed = time - startTime
        const progress = clamp(1 - elapsed / duration, 0, 1)
        const eased = progress * progress * (3 - 2 * progress)
        const nextProgress = startProgress * eased

        setWorksRevealProgress(nextProgress)

        if (nextProgress > 0.001 && activeIndexRef.current !== 3) {
          worksRecedeFrameRef.current = window.requestAnimationFrame(tick)
          return
        }

        worksRecedeFrameRef.current = undefined
        setWorksRevealProgress(0)
      }

      worksRecedeFrameRef.current = window.requestAnimationFrame(tick)
      return
    }
  }, [activeIndex, worksRevealProgress])

  useEffect(() => {
    worksRevealProgressRef.current = worksRevealProgress
  }, [worksRevealProgress])

  useEffect(() => {
    worksScrollImpulseRef.current = worksScrollImpulse
  }, [worksScrollImpulse])

  useEffect(() => {
    return () => {
      if (playgroundRecedeFrameRef.current !== undefined) {
        window.cancelAnimationFrame(playgroundRecedeFrameRef.current)
      }
      if (worksRecedeFrameRef.current !== undefined) {
        window.cancelAnimationFrame(worksRecedeFrameRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = performance.now()
      const target = targetOffsetRef.current
      const current = currentOffsetRef.current
      const next = current + (target - current) * 0.085
      const snapped = Math.abs(target - next) < 0.5 ? target : next

      if (Math.abs(snapped - currentOffsetRef.current) > 0.5) {
        currentOffsetRef.current = snapped
      }

      document.documentElement.style.setProperty('--app-scroll-offset', `${currentOffsetRef.current}px`)
      document.documentElement.style.setProperty(
        '--app-scroll-progress',
        maxOffset > 0 ? String(currentOffsetRef.current / maxOffset) : '0',
      )
      const nextWorksImpulse = worksScrollImpulseRef.current * 0.9
      if (Math.abs(nextWorksImpulse - worksScrollImpulseRef.current) > 0.001) {
        worksScrollImpulseRef.current = nextWorksImpulse
      }

      const shouldPublish =
        now - publishAtRef.current >= 120 ||
        Math.abs(publishedOffsetRef.current - currentOffsetRef.current) >= 4 ||
        Math.abs(publishedWorksScrollImpulseRef.current - worksScrollImpulseRef.current) >= 0.05

      if (shouldPublish) {
        publishAtRef.current = now
        publishedOffsetRef.current = currentOffsetRef.current
        publishedWorksScrollImpulseRef.current = worksScrollImpulseRef.current
        setCurrentOffset(currentOffsetRef.current)
        setWorksScrollImpulse(worksScrollImpulseRef.current)
      }

      frameRef.current = window.requestAnimationFrame(tick)
    }

    frameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== undefined) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [maxOffset, sectionStep])

  useEffect(() => {
    if (sections.length <= 1 || menuOpen) {
      return
    }

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) {
        return
      }

      const currentActiveIndex = activeIndexRef.current
      const delta =
        event.deltaMode === 1 ? event.deltaY * 28 : event.deltaMode === 2 ? event.deltaY * sectionStep : event.deltaY

      if (currentActiveIndex === 3) {
        const currentRevealProgress = worksRevealProgressRef.current
        const stageOffset = clampOffset(3 * sectionStep)
        const revealDelta = (delta / Math.max(1, sectionStep)) * 1.2
        const nextRevealProgress = clamp(currentRevealProgress + revealDelta, 0, 1)
        const snappedRevealProgress =
          nextRevealProgress > 0.995 ? 1 : nextRevealProgress < 0.005 ? 0 : nextRevealProgress

        setWorksRevealProgress(snappedRevealProgress)
        setWorksScrollImpulse((current) => Math.min(1, Math.max(current, Math.abs(delta) / Math.max(1, sectionStep) * 1.5)))

        if (delta > 0) {
          if (currentRevealProgress < 1) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }
        }

        if (delta < 0) {
          if (currentRevealProgress > 0) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }
        }
      }

      if (currentActiveIndex === 5) {
        const currentRevealProgress = playgroundRevealProgressRef.current
        const stageOffset = clampOffset(5 * sectionStep)
        const revealDelta = delta / Math.max(1, sectionStep) * 1.8
        const nextRevealProgress = Math.max(0, Math.min(1, currentRevealProgress + revealDelta))
        const snappedRevealProgress =
          nextRevealProgress > 0.995 ? 1 : nextRevealProgress < 0.005 ? 0 : nextRevealProgress

        setPlaygroundRevealProgress(snappedRevealProgress)

        if (delta > 0) {
          if (currentRevealProgress < 1) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }

          const dampedDelta = delta * 0.42
          snapToOffset(targetOffsetRef.current + dampedDelta)
          event.preventDefault()
          return
        }

        if (delta < 0) {
          if (currentRevealProgress > 0) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }

          const exitDelta = delta * 0.85
          snapToOffset(targetOffsetRef.current + exitDelta)
          event.preventDefault()
          return
        }
      }

      if (currentActiveIndex === 4) {
        const currentRevealProgress = experienceRevealProgressRef.current
        const stageOffset = clampOffset(4 * sectionStep)
        const revealDelta = (delta / Math.max(1, sectionStep)) * 1.6
        const nextRevealProgress = Math.max(0, Math.min(1, currentRevealProgress + revealDelta))
        const snappedRevealProgress =
          nextRevealProgress > 0.995 ? 1 : nextRevealProgress < 0.005 ? 0 : nextRevealProgress

        setExperienceRevealProgress(snappedRevealProgress)

        if (delta > 0) {
          if (currentRevealProgress < 1) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }
        }

        if (delta < 0) {
          if (currentRevealProgress > 0) {
            snapToOffset(stageOffset)
            event.preventDefault()
            return
          }
        }
      }

      const nextTarget = clampOffset(targetOffsetRef.current + delta * 0.85)
      targetOffsetRef.current = nextTarget

      if (delta > 0) {
        setScrollDirection(1)
        const shouldTriggerPhysics = armScrollPhysics()
        if (shouldTriggerPhysics) {
          setScrollPhysicsDirection(1)
          setScrollPhysicsStrength(Math.max(0.06, Math.min(0.22, Math.abs(delta) * 0.0032)))
        }
      } else {
        setScrollDirection(-1)
        touchScrollPhysics()
      }

      event.preventDefault()
    }

    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [armScrollPhysics, clampOffset, menuOpen, sections.length, sectionStep, touchScrollPhysics, viewport.height])

  return (
    <AppShellScrollProvider
      value={{
        scrollOffset: currentOffset,
        scrollProgress,
      viewportHeight: viewport.height,
      sectionStep,
      maxOffset,
      activeIndex,
        playgroundRevealProgress,
        experienceRevealProgress,
        worksRevealProgress,
        worksScrollImpulse,
        scrollPhysicsReady,
        scrollPhysicsPulseId,
        scrollPhysicsDirection,
        scrollPhysicsStrength,
        scrollDirection,
        requestHome,
      }}
    >
      <div className="app-shell">
        <LogoMark
          onClick={requestHome}
        />
        <CornerIcon open={menuOpen} onToggle={() => setMenuOpen((current) => !current)} />
        <SideDrawer
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
        {interactiveReady ? (
          <MagneticCursor
            x={position.x}
            y={position.y}
            locked={locked}
            width={size.width}
            height={size.height}
            mode={mode}
          />
        ) : null}
        <main className="app-shell__main">
          <div className="app-shell__viewport">
            {sections.map((section, index) => {
              const sectionId = navItems[index]?.id ?? `section-${index}`
              const sectionDistance = Math.abs(activeIndex - index)
              const sectionZIndex = sectionDistance === 0 ? 3 : sectionDistance === 1 ? 2 : 1

              return (
                <div
                  className="app-shell__section"
                  key={sectionId}
                  style={{
                    zIndex: sectionZIndex,
                    height: `${sectionStep}px`,
                  }}
                >
                  <SectionBridge sectionId={sectionId} sectionIndex={index}>
                    {section}
                  </SectionBridge>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    </AppShellScrollProvider>
  )
}
