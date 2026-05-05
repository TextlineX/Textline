import { type CSSProperties, type PropsWithChildren, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'

import './RevealFromBelow.less'

type RevealFromBelowProps = PropsWithChildren<{
  className?: string
  delayMs?: number
  enabled?: boolean
}>

export function RevealFromBelow({
  children,
  className,
  delayMs = 0,
  enabled = true,
}: RevealFromBelowProps) {
  const reduceMotion = useReducedMotion()
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const timerId = window.setTimeout(() => {
      setRevealed(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [delayMs, enabled])

  return (
    <div className={['reveal-from-below', className].filter(Boolean).join(' ')}>
      <motion.div
        className="reveal-from-below__inner"
        initial={reduceMotion ? false : { opacity: 0, y: '120%' }}
        animate={reduceMotion || !enabled ? undefined : revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: '120%' }}
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 0.42,
                ease: [0.16, 1, 0.3, 1],
              }
        }
        style={{ visibility: enabled ? 'visible' : 'hidden' } as CSSProperties}
      >
        {children}
      </motion.div>
    </div>
  )
}
