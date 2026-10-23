import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const listeners = new Set<() => void>()

function read(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(next: Theme) {
  document.documentElement.dataset.theme = next
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#15175e' : '#2b2cf0')
  try {
    localStorage.setItem('tl-theme', next)
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn())
}

export function toggleTheme() {
  setTheme(read() === 'dark' ? 'light' : 'dark')
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    read,
  )
}

/** Opens the command palette from anywhere (header button, shortcuts). */
export function openPalette() {
  window.dispatchEvent(new Event('tl:palette'))
}
