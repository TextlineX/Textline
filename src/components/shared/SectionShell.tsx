import type { PropsWithChildren } from 'react'

import './SectionShell.less'

type SectionShellProps = PropsWithChildren<{
  id: string
}>

export function SectionShell({ id, children }: SectionShellProps) {
  return (
    <section id={id} className="section-shell">
      <div className="section-shell__frame">{children}</div>
    </section>
  )
}
