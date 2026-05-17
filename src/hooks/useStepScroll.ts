import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

export function useStepScroll(stepMultiplier = 1) {
  useEffect(() => {
    const STEP = window.innerHeight * stepMultiplier
    let accum = 0
    let isAnimating = false

    const onWheel = (e: WheelEvent) => {
      if (isAnimating) return
      accum += e.deltaY

      const threshold = STEP * 0.6
      if (Math.abs(accum) >= threshold) {
        isAnimating = true
        const pages = accum > 0 ? 1 : -1
        const targetY = window.scrollY + STEP * pages

        gsap.to(window, {
          scrollTo: { y: targetY },
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: () => {
            accum = 0
            isAnimating = false
          },
        })
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [stepMultiplier])
}
