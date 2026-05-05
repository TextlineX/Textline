import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import './GooeyReveal.less'

type GooeyRevealProps = {
  active: boolean
  delayMs?: number
  avatarSrc?: string
}

export function GooeyReveal({ active, delayMs = 220, avatarSrc = '/avatar.png' }: GooeyRevealProps) {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!active) {
      return
    }

    const timerId = window.setTimeout(() => {
      setVisible(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timerId)
      setVisible(false)
    }
  }, [active, delayMs])

  return (
    <motion.div
      className="gooey-reveal"
      aria-hidden="true"
      initial={false}
      animate={
        visible
          ? {
              opacity: 1,
              scale: 1,
              x: '0%',
              y: '0%',
            }
          : {
              opacity: 0,
              scale: 0.58,
              x: '-12vw',
              y: '0%',
            }
      }
      transition={{
        opacity: { duration: 0.22, ease: 'easeOut' },
        scale: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
        x: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
        y: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      <svg className="gooey-reveal__defs" width="0" height="0" focusable="false" aria-hidden="true">
        <filter id="gooey-reveal-filter">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="gooey"
          />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </svg>

      <div className="gooey-reveal__blob">
        <motion.div
          className="gooey-reveal__orb gooey-reveal__orb--one"
          animate={
            reduceMotion || !visible
              ? undefined
              : {
                  x: [0, 7, -4, 0],
                  y: [0, -6, 3, 0],
                  scale: [1, 1.08, 0.97, 1],
                }
          }
          transition={
            reduceMotion || !visible
              ? undefined
              : {
                  duration: 4.8,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }
          }
        />
        <motion.div
          className="gooey-reveal__orb gooey-reveal__orb--two"
          animate={
            reduceMotion || !visible
              ? undefined
              : {
                  x: [0, -6, 5, 0],
                  y: [0, 5, -4, 0],
                  scale: [1, 0.97, 1.05, 1],
                }
          }
          transition={
            reduceMotion || !visible
              ? undefined
              : {
                  duration: 5.6,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: 0.35,
                }
          }
        />
        <motion.div
          className="gooey-reveal__avatar"
          animate={
            reduceMotion || !visible
              ? {
                  rotate: 0,
                }
              : {
                  rotate: [0, 1.8, -1.2, 0],
                  scale: [1, 1.03, 0.992, 1],
                }
          }
          transition={
            reduceMotion || !visible
              ? { duration: 0.22, ease: 'easeOut' }
              : {
                  duration: 4.4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                }
          }
        >
          <img className="gooey-reveal__avatar-image" src={avatarSrc} alt="" />
        </motion.div>
      </div>
    </motion.div>
  )
}
