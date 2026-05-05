import { motion, useReducedMotion } from 'motion/react'

import './SideDrawer.less'

type SideDrawerProps = {
  open: boolean
  onClose: () => void
}

export function SideDrawer({ open, onClose }: SideDrawerProps) {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <motion.div
        className="side-drawer__backdrop"
        aria-hidden="true"
        initial={false}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />
      <motion.aside
        className="side-drawer"
        aria-hidden={!open}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
        initial={false}
        animate={{
          x: open ? 0 : '100%',
          opacity: open ? 1 : 0.92,
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 210, damping: 28, mass: 0.92 }
        }
      >
        <div className="side-drawer__panel">
          <div className="side-drawer__header">
            <div className="side-drawer__eyebrow">Menu</div>
            <div className="side-drawer__title">Panel</div>
          </div>

          <div className="side-drawer__body">
            <p className="side-drawer__copy">Navigation is handled by the wheel and the corner controls.</p>
          </div>

          <div className="side-drawer__footer">
            <div className="side-drawer__hint">Wheel / click / keyboard controls</div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
