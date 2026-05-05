import { type ComponentPropsWithoutRef, type ElementType, type PropsWithChildren } from 'react'

import { ScrollLinger } from '../../effects/text/ScrollLinger'

type StickyMagneticTitleProps<TTag extends ElementType> = PropsWithChildren<{
  as?: TTag
  className?: string
  targetClassName?: string
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
  magneticShell?: string
  avatarTrigger?: boolean
}> & Omit<ComponentPropsWithoutRef<TTag>, 'as' | 'className' | 'children'>

export function StickyMagneticTitle<TTag extends ElementType = 'div'>({
  as,
  className,
  targetClassName,
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
  magneticShell = 'tight',
  avatarTrigger = false,
  children,
  ...rest
}: StickyMagneticTitleProps<TTag>) {
  const Tag = (as ?? 'div') as ElementType

  return (
    <ScrollLinger
      className={className}
      debugLabel={debugLabel}
      sectionIndex={sectionIndex}
      anchorVh={anchorVh}
      stickTopVh={stickTopVh}
      lingerVh={lingerVh}
      releaseVh={releaseVh}
      fadeVh={fadeVh}
      blurDelayVh={blurDelayVh}
      blurSpanVh={blurSpanVh}
      blurMaxPx={blurMaxPx}
      followDelayVh={followDelayVh}
      followEase={followEase}
    >
      <Tag
        {...rest}
        className={['sticky-magnetic-title__target', 'magnetic-target', targetClassName].filter(Boolean).join(' ')}
        data-magnetic-shell={magneticShell}
        data-avatar-trigger={avatarTrigger ? 'true' : undefined}
      >
        {children}
      </Tag>
    </ScrollLinger>
  )
}
