import { useEffect } from 'react'

function setTag(selector: string, attr: string, value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * Keeps <title>, the description and the share-card tags in sync with the page.
 * Crawlers that run JS (Google) see per-page values; others fall back to index.html.
 */
export function useMeta(title: string, description: string) {
  useEffect(() => {
    const full = title === 'Textline' ? title : `${title} — Textline`
    document.title = full
    setTag('meta[name="description"]', 'content', description)
    setTag('meta[property="og:title"]', 'content', full)
    setTag('meta[property="og:description"]', 'content', description)
    setTag('meta[name="twitter:title"]', 'content', full)
    setTag('meta[name="twitter:description"]', 'content', description)
  }, [title, description])
}
