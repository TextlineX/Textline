import { useEffect, useMemo, useState } from 'react'

import { isBrowser } from '../../utils/isBrowser'

type UseTextScatterOptions = {
  text: string
  dataset: readonly string[]
  durationMs?: number
  intervalMs?: number
  enabled?: boolean
}

function pickRandomItem(dataset: readonly string[], index: number, seed: number) {
  if (dataset.length === 0) {
    return ''
  }

  return dataset[(index + seed) % dataset.length]
}

export function useTextScatter({
  text,
  dataset,
  durationMs = 1000,
  intervalMs = 40,
  enabled = true,
}: UseTextScatterOptions) {
  const letters = useMemo(() => text.split(''), [text])
  const [settled, setSettled] = useState(false)
  const [visibleLetters, setVisibleLetters] = useState<string[]>(letters)

  useEffect(() => {
    if (!isBrowser() || !enabled) {
      return
    }

    let tick = 0
    const seed = Math.floor(Math.random() * 1000)
    const resetId = window.setTimeout(() => {
      setSettled(false)
    }, 0)

    const intervalId = window.setInterval(() => {
      tick += 1
      setVisibleLetters(
        letters.map((letter, index) => {
          if (letter === ' ') {
            return ' '
          }

          return pickRandomItem(dataset, tick, seed + index)
        }),
      )
    }, intervalMs)

    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId)
      setVisibleLetters(letters)
      setSettled(true)
    }, durationMs)

    return () => {
      window.clearTimeout(resetId)
      window.clearInterval(intervalId)
      window.clearTimeout(timeoutId)
    }
  }, [dataset, durationMs, enabled, intervalMs, letters])

  return {
    letters: enabled ? visibleLetters : letters,
    settled: enabled ? settled : false,
  }
}
