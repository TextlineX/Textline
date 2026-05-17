import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import './ContactSection.less'

const contactLinks = [
  { label: 'Email', value: 'textline@example.com', href: 'mailto:textline@example.com' },
  { label: 'GitHub', value: 'github.com/textline', href: 'https://github.com/textline' },
  { label: 'Blog', value: 'textline.dev', href: 'https://textline.dev' },
]

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const titleBackRef = useRef<HTMLHeadingElement | null>(null)
  const titleFrontRef = useRef<HTMLHeadingElement | null>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = [titleBackRef.current, titleFrontRef.current, ...linkRefs.current].filter(Boolean)
    gsap.set(targets, { x: 1.6, yPercent: 100 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 20%',
        toggleActions: 'play none none reverse',
      },
    })

    tl.to(titleBackRef.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0)
      .to(titleFrontRef.current, { x: 1.6, yPercent: 0, duration: 0.72, ease: 'power3.out' }, 0.04)
      .to(linkRefs.current.filter(Boolean), { x: 1.6, yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, 0.15)

    // 滚动淡出
    gsap.to([titleBackRef.current, titleFrontRef.current].filter(Boolean), {
      y: -80,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'center top',
        scrub: 1,
      },
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.trigger === section) st.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="contact-section" aria-labelledby="contact-section-title">
      <div className="contact-section__inner">
        <div className="contact-section__title-stack" aria-hidden="true">
          <h1 ref={titleBackRef} className="contact-section__title contact-section__title--back" id="contact-section-title">
            CONTACT
          </h1>
          <h1 ref={titleFrontRef} className="contact-section__title contact-section__title--front">
            CONTACT
          </h1>
        </div>

        <ul className="contact-section__list">
          {contactLinks.map((link, i) => (
            <li key={link.label} className="contact-section__item">
              <span className="contact-section__item-label">{link.label}</span>
              <a
                ref={(el) => { linkRefs.current[i] = el }}
                href={link.href}
                className="contact-section__item-value"
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}