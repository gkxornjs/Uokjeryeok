// MottoConfetti.tsx
'use client'
import { useEffect, useRef } from 'react'

export default function MottoConfetti({ fire, targetId }: { fire: boolean; targetId?: string }) {
  const used = useRef(false)
  useEffect(() => {
    if (!fire || used.current) return
    used.current = true
    import('canvas-confetti').then(({ default: confetti }) => {
      const el = targetId ? document.getElementById(targetId) : null
      const origin = el
        ? (() => {
            const r = el.getBoundingClientRect()
            return {
              x: (r.left + r.width / 2) / window.innerWidth,
              y: Math.max(0.1, (r.top + 10) / window.innerHeight),
            }
          })()
        : { x: 0.5, y: 0.25 }

      const end = Date.now() + 900
      ;(function frame() {
        confetti({ particleCount: 4, startVelocity: 32, spread: 60, ticks: 60, origin })
        if (Date.now() < end) requestAnimationFrame(frame)
      })()
    })
    const t = setTimeout(() => (used.current = false), 1200)
    return () => clearTimeout(t)
  }, [fire, targetId])
  return null
}
