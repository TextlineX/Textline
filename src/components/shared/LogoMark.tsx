import { motion, useReducedMotion } from 'motion/react'

import { useBootContext } from '../layout/BootContext'
import './LogoMark.less'

type LogoMarkProps = {
  onClick?: () => void
}

export function LogoMark({ onClick }: LogoMarkProps) {
  const { bootComplete } = useBootContext()
  const reduceMotion = useReducedMotion()

  return (
    <div className="logo-mark-shell">
      <motion.button
        className="logo-mark magnetic-target"
        type="button"
        data-magnetic-shell="compact"
        aria-label="回到首页"
        onClick={onClick}
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
            : { duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0 }
        }
      >
        <img
          className="logo-mark__icon"
          src="/textline-icon-pack/textline-icon-white.svg"
          alt=""
          aria-hidden="true"
        />
      </motion.button>
    </div>
  )
}
