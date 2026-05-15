import { type CSSProperties, type PropsWithChildren } from 'react'

import { useAppShellScroll } from '../../components/layout/AppShellScrollContext'
import './ScrollLingerText.less'

export type ScrollLingerProps = PropsWithChildren<{
  className?: string
  debugLabel?: string
  sectionIndex: number
  anchorVh?: number
  stickTopVh?: number
  lingerVh?: number
  releaseVh?: number
  fadeVh?: number
  blurDelayVh?: number
  blurSpanVh?: number
  blurMaxPx?: number
  followDelayVh?: number
  followEase?: number
}>

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

function smoothstep(edge0: number, edge1: number, value: number) {
  if (edge0 === edge1) {
    return value >= edge1 ? 1 : 0
  }

  const x = clamp((value - edge0) / (edge1 - edge0), 0, 1)
  return x * x * (3 - 2 * x)
}

/**
 * 通用的“顶部滞留 + 跟随滚动 + 渐隐”容器。
 * 适合标题、分组标签、强调文案等需要在顶部停留一段时间的内容。
 */
export function ScrollLinger({
  children,
  className,
  debugLabel,
  sectionIndex,
  anchorVh = 0.5,
  stickTopVh = 0.11,
  lingerVh = 0.22,
  releaseVh = 0.18,
  fadeVh = 0.22,
  blurDelayVh = 0.08,
  blurSpanVh = 0.18,
  blurMaxPx = 7,
  followDelayVh = 0,
  followEase = 1,
}: ScrollLingerProps) {
  const { scrollOffset, sectionStep } = useAppShellScroll()

  const stickTop = Math.max(12, sectionStep * stickTopVh)
  const anchorOffset = sectionStep * anchorVh
  const sectionStart = sectionIndex * sectionStep
  const lingerDistance = Math.max(sectionStep * lingerVh, stickTop * 1.25)
  const releaseDistance = Math.max(sectionStep * releaseVh, stickTop)
  const fadeDistance = Math.max(sectionStep * fadeVh, stickTop * 1.2)
  const blurDelayDistance = sectionStep * blurDelayVh
  const blurSpanDistance = Math.max(sectionStep * blurSpanVh, 1)
  const followDelayDistance = sectionStep * followDelayVh
  const followEaseClamped = clamp(followEase, 0.02, 1)

  const pinStart = sectionStart + anchorOffset - stickTop
  const pinEnd = pinStart + lingerDistance
  const releaseEnd = pinEnd + releaseDistance
  const fadeEnd = releaseEnd + fadeDistance
  const blurStart = releaseEnd + blurDelayDistance
  const blurEnd = blurStart + blurSpanDistance
  const followStart = pinStart + followDelayDistance
  const state =
    scrollOffset < pinStart ? 'pre-pin' : scrollOffset < pinEnd ? 'hold' : scrollOffset < releaseEnd ? 'release' : 'fade'

  const pinProgress = smoothstep(pinStart, pinEnd, scrollOffset)
  const releaseProgress = smoothstep(pinEnd, releaseEnd, scrollOffset)
  const fadeProgress = smoothstep(releaseEnd, fadeEnd, scrollOffset)
  const blurProgress = smoothstep(blurStart, blurEnd, scrollOffset)

  const pinOffset = scrollOffset - pinStart
  const pinnedTranslateY = Math.max(0, pinOffset)
  const followOffset = Math.max(0, scrollOffset - followStart)
  const followedTranslateY = pinnedTranslateY * followEaseClamped + followOffset * (1 - followEaseClamped) * 0.5
  const releasedTranslateY = lerp(followedTranslateY, 0, releaseProgress)
  const transformY = scrollOffset < pinStart ? 0 : scrollOffset < releaseEnd ? followedTranslateY : releasedTranslateY

  const opacity = scrollOffset < releaseEnd ? 1 : 1 - fadeProgress
  return (
    <div
      className={['scroll-linger-text', className].filter(Boolean).join(' ')}
      style={
        {
          transform: `translate3d(0, ${transformY}px, 0)`,
          opacity: clamp(opacity, 0, 1),
          '--scroll-linger-progress': pinProgress,
          '--scroll-linger-release-progress': releaseProgress,
          '--scroll-linger-fade-progress': fadeProgress,
          '--scroll-linger-blur-progress': blurProgress,
          '--scroll-linger-blur-max': `${blurMaxPx}px`,
          '--scroll-linger-pin-start': `${pinStart}px`,
          '--scroll-linger-pin-end': `${pinEnd}px`,
          '--scroll-linger-release-end': `${releaseEnd}px`,
          '--scroll-linger-follow-start': `${followStart}px`,
          '--scroll-linger-transform-y': `${transformY}px`,
        } as CSSProperties
      }
      data-scroll-linger="true"
      data-scroll-linger-state={state}
      data-scroll-linger-label={debugLabel ?? ''}
      data-scroll-linger-pin-start={pinStart}
      data-scroll-linger-pin-end={pinEnd}
      data-scroll-linger-release-end={releaseEnd}
      data-scroll-linger-follow-start={followStart}
    >
      {children}
    </div>
  )
}
