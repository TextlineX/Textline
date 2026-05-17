import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { catalogCategories } from '../../data/catalogData.ts'
import './Catalog.less'

gsap.registerPlugin(ScrollTrigger)

export function Catalog() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const list = listRef.current
    if (!section || !list) return

    const items = list.querySelectorAll('.catalog__item')

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      }
    })

    items.forEach((item, i) => {
      tl.fromTo(
        item,
        { scale: 0.85, opacity: 0.5 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' },
        i * 0.5
      )

      tl.to(
        item,
        { scale: 0.85, opacity: 0.5, duration: 0.2, ease: 'power2.in' },
        i * 0.5 + 0.35
      )
    })
  }, [])

  return (
    <section ref={sectionRef} className="catalog">
      <ul ref={listRef} className="catalog__list">
        {catalogCategories.map((item) => (
          <li key={item.id} className="catalog__item">
            <span className="catalog__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
