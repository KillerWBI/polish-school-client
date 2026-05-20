import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Логотип: анимированный «лепестковый» значок + текст PLatform
export default function Logo({ size = 'md', onClick }) {
  const dotsRef = useRef(null)
  const SIZES = {
    sm: { mark: 'w-7 h-7', text: 'text-base' },
    md: { mark: 'w-9 h-9', text: 'text-lg' },
    lg: { mark: 'w-12 h-12', text: 'text-2xl' },
  }
  const s = SIZES[size]

  useEffect(() => {
    if (!dotsRef.current) return
    const dots = dotsRef.current.querySelectorAll('[data-dot]')
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'sine.inOut' } })
    tl.to(dots, { rotate: 360, duration: 8, transformOrigin: '50% 50%' }, 0)
    dots.forEach((d, i) => {
      tl.to(d, { scale: 1.3, duration: 1.2, yoyo: true, repeat: -1, delay: i * 0.2 }, 0)
    })
    return () => tl.kill()
  }, [])

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 group cursor-pointer select-none"
    >
      {/* Анимированный значок */}
      <div className={`relative ${s.mark}`} ref={dotsRef}>
        <div className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#8B5CF6_0%,#EC4899_100%)] opacity-90 group-hover:opacity-100 transition-opacity" />
        <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full">
          <g>
            <circle data-dot cx="20" cy="6"  r="3" fill="#fff" opacity="0.95" />
            <circle data-dot cx="34" cy="20" r="2.5" fill="#fff" opacity="0.75" />
            <circle data-dot cx="20" cy="34" r="2" fill="#fff" opacity="0.6" />
            <circle data-dot cx="6"  cy="20" r="2.5" fill="#fff" opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Текст */}
      <span className={`font-semibold tracking-tight text-ink ${s.text}`}>
        P<span className="text-gradient">L</span>atform
      </span>
    </button>
  )
}
