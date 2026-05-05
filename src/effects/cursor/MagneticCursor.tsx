import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'

import './MagneticCursor.less'

type MagneticCursorProps = {
  x: number
  y: number
  locked: boolean
  width: number
  height: number
  mode?: 'default' | 'click' | 'tunnel' | 'grid' | 'drag'
}

export function MagneticCursor({ x, y, locked, width, height, mode = 'default' }: MagneticCursorProps) {
  const cursor = (
    <div
      className={`magnetic-cursor${locked ? ' magnetic-cursor--locked' : ''}${mode === 'click' ? ' magnetic-cursor--click' : ''}${mode === 'tunnel' ? ' magnetic-cursor--tunnel' : ''}${mode === 'grid' ? ' magnetic-cursor--grid' : ''}${mode === 'drag' ? ' magnetic-cursor--drag' : ''}`}
      style={
        {
          '--cursor-width': `${width}px`,
          '--cursor-height': `${height}px`,
          transform: `translate(${x}px, ${y}px)`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="magnetic-cursor__corner magnetic-cursor__corner--tl" />
      <span className="magnetic-cursor__corner magnetic-cursor__corner--tr" />
      <span className="magnetic-cursor__corner magnetic-cursor__corner--bl" />
      <span className="magnetic-cursor__corner magnetic-cursor__corner--br" />
      {mode === 'click' || mode === 'tunnel' || mode === 'grid' || mode === 'drag' ? <span className="magnetic-cursor__core" /> : null}
      {mode === 'tunnel' || mode === 'grid' || mode === 'drag' ? <span className="magnetic-cursor__orbital" /> : null}
    </div>
  )

  if (typeof document === 'undefined') {
    return cursor
  }

  return createPortal(cursor, document.body)
}
