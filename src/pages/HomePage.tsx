import { ui, useLang } from '../i18n'
import { useMeta } from '../meta'

import { Hero } from '../sections/Hero'
import { Works } from '../sections/Works'
import { About } from '../sections/About'
import { Contact } from '../sections/Contact'

export function HomePage() {
  const { t } = useLang()
  useMeta('Textline', t(ui.hero.tagline))

  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <Works />
      <About />
      <Contact />
    </main>
  )
}
