import { motion, useReducedMotion } from 'motion/react'

import { navItems } from '../../data/siteData'
import './SideDrawer.less'

type SideDrawerProps = {
  open: boolean
  activeIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export function SideDrawer({ open, activeIndex, onClose, onNavigate }: SideDrawerProps) {
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
            <div className="side-drawer__title">Sections</div>
          </div>

          <nav className="side-drawer__nav" aria-label="Section navigation">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`side-drawer__item magnetic-target${index === activeIndex ? ' side-drawer__item--active' : ''}`}
                data-magnetic-shell="tight"
                onClick={() => {
                  onNavigate(index)
                  onClose()
                }}
              >
                <span className="side-drawer__item-index">0{index + 1}</span>
                <span className="side-drawer__item-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="side-drawer__footer">
            <div className="side-drawer__hint">Wheel / click / keyboard navigation</div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
