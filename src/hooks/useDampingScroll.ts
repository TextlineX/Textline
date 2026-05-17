import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function useDampingScroll(damping = 0.08) {
  const targetY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const onWheel = (e: WheelEvent) => {
      targetY.current += e.deltaY * 0.6
    }

    let lastTouchY = 0
    const onTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      const delta = (e.touches[0].clientY - lastTouchY) * 1.5
      targetY.current += delta
      lastTouchY = e.touches[0].clientY
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    const pageHeight = document.body.scrollHeight
    document.body.style.height = `${pageHeight}px`

    const ticker = gsap.ticker.add(() => {
      currentY.current += (targetY.current - currentY.current) * damping
      currentY.current = Math.max(0, Math.min(currentY.current, pageHeight - window.innerHeight))
      window.scrollTo(0, currentY.current)
    })

    return () => {
      document.body.style.overflow = ''
      document.body.style.height = ''
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      gsap.ticker.remove(ticker)
    }
  }, [damping])
}
