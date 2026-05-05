export function throttle<T extends (...args: unknown[]) => void>(fn: T, wait: number) {
  let lastCall = 0
  let timeoutId: number | undefined

  return (...args: Parameters<T>) => {
    const now = Date.now()
    const remaining = wait - (now - lastCall)

    if (remaining <= 0) {
      lastCall = now
      fn(...args)
      return
    }

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      lastCall = Date.now()
      timeoutId = undefined
      fn(...args)
    }, remaining)
  }
}
