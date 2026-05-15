import './StageBackdrop.less'
import { AsciiWavesBackdrop } from './background/AsciiWavesBackdrop'

type StageBackdropProps = {
  enabled?: boolean
}

export function StageBackdrop({ enabled = true }: StageBackdropProps) {
  if (!enabled) {
    return null
  }

  return (
    <div className="stage-backdrop" aria-hidden="true">
      <AsciiWavesBackdrop />
    </div>
  )
}
