import { readFileSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Site plumbing done at build time:
 * - fills %SITE_URL% in index.html (absolute share-card URLs need the real domain)
 * - writes robots.txt, and sitemap.xml when VITE_SITE_URL is set
 * - copies index.html to 404.html so GitHub Pages serves the SPA on deep links
 */
function sitePlugin(siteUrl: string): Plugin {
  const workIds = () => {
    const src = readFileSync(resolve(__dirname, 'src/data/works.ts'), 'utf8')
    const list = src.slice(src.indexOf('export const works'))
    return [...list.matchAll(/^ {4}id: '([^']+)'/gm)].map((m) => m[1])
  }

  return {
    name: 'textline-site',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /']
      if (siteUrl) {
        const paths = ['/', '/work', '/about', ...workIds().map((id) => `/work/${id}`)]
        const today = new Date().toISOString().slice(0, 10)
        const body = paths
          .map((p) => `  <url><loc>${siteUrl}${p}</loc><lastmod>${today}</lastmod></url>`)
          .join('\n')
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
        })
        robots.push(`Sitemap: ${siteUrl}/sitemap.xml`)
      } else {
        this.warn('VITE_SITE_URL is not set: share cards use relative URLs and no sitemap is written.')
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
    },
    closeBundle() {
      try {
        copyFileSync(resolve(__dirname, 'dist/index.html'), resolve(__dirname, 'dist/404.html'))
      } catch {
        /* dev server: no dist */
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, 'VITE_')
  const siteUrl = (env.VITE_SITE_URL ?? '').replace(/\/+$/, '')

  return {
    plugins: [react(), sitePlugin(siteUrl)],
    server: { host: '0.0.0.0' },
    preview: { host: '0.0.0.0' },
  }
})
