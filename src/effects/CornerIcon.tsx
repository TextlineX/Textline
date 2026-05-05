import { useEffect, useRef } from 'react'

import { gsap } from 'gsap'
import { motion, useReducedMotion } from 'motion/react'

import { useBootContext } from '../components/layout/BootContext'
import './CornerIcon.less'

type CornerIconProps = {
  open: boolean
  onToggle: () => void
}

export function CornerIcon({ open, onToggle }: CornerIconProps) {
  const { bootComplete } = useBootContext()
  const reduceMotion = useReducedMotion()
  const frameRef = useRef<SVGRectElement | null>(null)
  const topLineRef = useRef<SVGLineElement | null>(null)
  const middleLineRef = useRef<SVGLineElement | null>(null)
  const bottomLineRef = useRef<SVGLineElement | null>(null)
  const coreRef = useRef<SVGRectElement | null>(null)
  const glowRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    const topLine = topLineRef.current
    const middleLine = middleLineRef.current
    const bottomLine = bottomLineRef.current
    const core = coreRef.current
    const glow = glowRef.current

    if (!frame || !topLine || !middleLine || !bottomLine || !core || !glow) {
      return
    }

    const menuState = {
      frameRotate: 0,
      frameScale: 1,
      top: { x1: 15, y1: 18, x2: 33, y2: 18 },
      midOpacity: 1,
      midScale: 1,
      bottom: { x1: 15, y1: 30, x2: 33, y2: 30 },
      coreRotate: 0,
      coreScale: 1,
      coreOpacity: 0.95,
      glowScale: 1,
      glowOpacity: 1,
    }

    const closeState = {
      frameRotate: 90,
      frameScale: 1.06,
      top: { x1: 17, y1: 17, x2: 31, y2: 31 },
      midOpacity: 0,
      midScale: 0.32,
      bottom: { x1: 17, y1: 31, x2: 31, y2: 17 },
      coreRotate: 45,
      coreScale: 0.72,
      coreOpacity: 0.42,
      glowScale: 1.08,
      glowOpacity: 1,
    }

    const target = open ? closeState : menuState

    if (reduceMotion) {
      gsap.set(frame, {
        rotation: target.frameRotate,
        scale: target.frameScale,
        transformOrigin: '50% 50%',
      })
      gsap.set(topLine, { attr: target.top })
      gsap.set(middleLine, {
        opacity: target.midOpacity,
        scaleX: target.midScale,
        transformOrigin: '50% 50%',
      })
      gsap.set(bottomLine, { attr: target.bottom })
      gsap.set(core, {
        rotation: target.coreRotate,
        scale: target.coreScale,
        opacity: target.coreOpacity,
        transformOrigin: '50% 50%',
      })
      gsap.set(glow, {
        scale: target.glowScale,
        opacity: target.glowOpacity,
        transformOrigin: '50% 50%',
      })
      return
    }

    const timeline = gsap.timeline({
      defaults: {
        duration: 0.52,
        ease: 'power3.inOut',
      },
    })

    timeline.to(
      frame,
      {
        rotation: target.frameRotate,
        scale: target.frameScale,
        transformOrigin: '50% 50%',
      },
      0,
    )
    timeline.to(topLine, { attr: target.top }, 0)
    timeline.to(
      middleLine,
      {
        opacity: target.midOpacity,
        scaleX: target.midScale,
        transformOrigin: '50% 50%',
      },
      0,
    )
    timeline.to(bottomLine, { attr: target.bottom }, 0)
    timeline.to(
      core,
      {
        rotation: target.coreRotate,
        scale: target.coreScale,
        opacity: target.coreOpacity,
        transformOrigin: '50% 50%',
      },
      0,
    )
    timeline.to(
      glow,
      {
        scale: target.glowScale,
        opacity: target.glowOpacity,
        transformOrigin: '50% 50%',
      },
      0,
    )

    return () => {
      timeline.kill()
    }
  }, [open, reduceMotion])

  return (
    <div className="corner-icon-shell">
      <motion.button
        className={`corner-icon magnetic-target${open ? ' corner-icon--open' : ''}`}
        type="button"
        data-magnetic-shell="compact"
        aria-label={open ? '关闭菜单' : '打开菜单'}
        aria-expanded={open}
        onClick={onToggle}
        initial={reduceMotion ? false : { opacity: 0, y: '120%' }}
        animate={
          reduceMotion
            ? undefined
            : bootComplete
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: '120%' }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.04 }
        }
      >
        <svg className="corner-icon__svg" viewBox="0 0 48 48" aria-hidden="true">
          <rect ref={frameRef} className="corner-icon__frame" x="8" y="8" width="32" height="32" rx="5" ry="5" />

          <g className="corner-icon__bars">
            <line ref={topLineRef} className="corner-icon__line corner-icon__line--top" x1="15" y1="18" x2="33" y2="18" />
            <line
              ref={middleLineRef}
              className="corner-icon__line corner-icon__line--mid"
              x1="15"
              y1="24"
              x2="33"
              y2="24"
            />
            <line
              ref={bottomLineRef}
              className="corner-icon__line corner-icon__line--bot"
              x1="15"
              y1="30"
              x2="33"
              y2="30"
            />
          </g>

          <rect ref={coreRef} className="corner-icon__core" x="17" y="17" width="14" height="14" rx="3" ry="3" />
        </svg>
        <span ref={glowRef} className="corner-icon__glow" aria-hidden="true" />
      </motion.button>
    </div>
  )
}
