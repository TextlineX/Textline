import { useAppShellScroll } from '../components/layout/AppShellScrollContext'

type UseSectionWindowOptions = {
  sectionIndex: number
  preloadBefore?: number
  preloadAfter?: number
}

export function useSectionWindow({
  sectionIndex,
  preloadBefore = 2,
  preloadAfter = 2,
}: UseSectionWindowOptions) {
  const { activeIndex } = useAppShellScroll()
  const isPreloaded = activeIndex >= sectionIndex - preloadBefore && activeIndex <= sectionIndex + preloadAfter
  const isActive = activeIndex === sectionIndex

  return {
    activeIndex,
    isActive,
    isPreloaded,
  }
}
