import './StageBackdrop.less'
import { AsciiWavesBackdrop } from './background/AsciiWavesBackdrop'

export function StageBackdrop() {
  return (
    <div className="stage-backdrop" aria-hidden="true">
      <AsciiWavesBackdrop />
    </div>
  )
}
