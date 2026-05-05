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
          <rect className="corner-icon__frame" x="8" y="8" width="32" height="32" rx="5" ry="5" />

          <g className="corner-icon__bars">
            <path className="corner-icon__line corner-icon__line--top" d="M15 18H33" />
            <path className="corner-icon__line corner-icon__line--mid" d="M15 24H33" />
            <path className="corner-icon__line corner-icon__line--bot" d="M15 30H33" />
          </g>

          <rect className="corner-icon__core" x="17" y="17" width="14" height="14" rx="3" ry="3" />
        </svg>
        <span className="corner-icon__glow" aria-hidden="true" />
      </motion.button>
    </div>
  )
}
