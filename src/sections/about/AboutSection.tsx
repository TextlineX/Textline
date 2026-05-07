import { useEffect, useRef, useState } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import { SectionShell } from '../../components/shared/SectionShell'
import { StickyMagneticTitle } from '../../components/shared/StickyMagneticTitle'
import { GameCanvasScene } from '../../pages/game/components/GameCanvasScene'
import { useGameMachine } from '../../pages/game/useGameMachine'
import { AboutShowcaseModel } from './AboutShowcaseModel'

import './AboutSection.less'

export function AboutSection() {
  const { scrollOffset, viewportHeight } = useAppShellScroll()
  const sectionProgress = viewportHeight > 0 ? scrollOffset / viewportHeight - 1 : 0
  const engaged = sectionProgress >= -1.1 && sectionProgress <= 0.85
  const [screenLinked, setScreenLinked] = useState(false)
  const [screenTextureSource, setScreenTextureSource] = useState<HTMLCanvasElement | null>(null)
  const screenOpenTimerRef = useRef<number | null>(null)
  const screenCloseTimerRef = useRef<number | null>(null)

  const { activeCard, activeCardIndex, phase } = useGameMachine({
    embed: true,
    simulate: true,
  })

  useEffect(() => {
    if (screenOpenTimerRef.current !== null) {
      window.clearTimeout(screenOpenTimerRef.current)
      screenOpenTimerRef.current = null
    }

    if (screenCloseTimerRef.current !== null) {
      window.clearTimeout(screenCloseTimerRef.current)
      screenCloseTimerRef.current = null
    }

    if (engaged) {
      screenOpenTimerRef.current = window.setTimeout(() => {
        setScreenLinked(true)
      }, 220)
    } else {
      screenCloseTimerRef.current = window.setTimeout(() => {
        setScreenLinked(false)
      }, 500)
    }

    return () => {
      if (screenOpenTimerRef.current !== null) {
        window.clearTimeout(screenOpenTimerRef.current)
        screenOpenTimerRef.current = null
      }

      if (screenCloseTimerRef.current !== null) {
        window.clearTimeout(screenCloseTimerRef.current)
        screenCloseTimerRef.current = null
      }
    }
  }, [engaged])

  useEffect(() => {
    if (!screenLinked) {
      setScreenTextureSource(null)
    }
  }, [screenLinked])

  const sendGameKey = (key: 'up' | 'down' | 'left' | 'right' | 'a' | 'b') => {
    window.dispatchEvent(
      new CustomEvent('game-control', {
        detail: {
          key,
          pressed: true,
        },
      }),
    )
  }

  const handleModelCommand = (command: 'rotate-left' | 'rotate-right' | 'tilt-up' | 'tilt-down' | 'focus-screen') => {
    if (command === 'rotate-left') {
      sendGameKey('left')
      return
    }

    if (command === 'rotate-right') {
      sendGameKey('right')
      return
    }

    if (command === 'tilt-up') {
      sendGameKey('up')
      return
    }

    if (command === 'tilt-down') {
      sendGameKey('down')
      return
    }

    setScreenLinked(true)
  }

  return (
    <SectionShell id="about">
      <section className="about-showcase" aria-labelledby="about-showcase-title">
        <div className="about-showcase__layout">
          <header className="about-showcase__header">
            <StickyMagneticTitle
              as="h2"
              id="about-showcase-title"
              className="about-showcase__title-linger"
              sectionIndex={1}
              anchorVh={0.1}
              blurDelayVh={0.1}
              blurSpanVh={0.14}
              blurMaxPx={5}
              followDelayVh={0.02}
              followEase={0.88}
              targetClassName="about-showcase__title"
              stickTopVh={0.08}
              lingerVh={0.24}
              releaseVh={0.16}
              fadeVh={0.2}
            >
              <span>About</span>
            </StickyMagneticTitle>
          </header>

          <aside className="about-showcase__visual" aria-label="about three.js showcase">
            <div className="about-showcase__visual-frame">
              {engaged ? (
                <>
                  <AboutShowcaseModel
                    modelUrl="/models/gb.glb"
                    onCommand={handleModelCommand}
                    screenTextureSource={screenTextureSource}
                  />
                  {screenLinked ? (
                    <div className="about-showcase__screen-source-shell" aria-hidden="true">
                      <GameCanvasScene
                        phase={phase}
                        activeCardIndex={activeCardIndex}
                        activeCard={activeCard}
                        className="about-showcase__screen-source"
                        onCanvasReady={setScreenTextureSource}
                        rotateForTexture
                        renderMode="texture"
                      />
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="about-showcase-model__overlay" aria-hidden="true">
                  <div className="about-showcase-model__overlay-title">SCROLL TO ACTIVATE</div>
                  <div className="about-showcase-model__overlay-copy">GB 模型只在该窗口可见时运行。</div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </SectionShell>
  )
}
