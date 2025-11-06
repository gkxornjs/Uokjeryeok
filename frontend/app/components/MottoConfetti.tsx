'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

/**
 * fire가 true로 변할 때마다 confetti를 한 번 쏩니다.
 * targetId를 주면 해당 엘리먼트 위에서 폭죽이 터짐
 */
export default function MottoConfetti({
  fire,
  targetId,
  colors = ['#60a5fa', '#34d399', '#f59e0b', '#f43f5e'],
}: {
  fire: boolean
  targetId?: string
  colors?: string[]
}) {
const used = useRef(false)

  useEffect(() => {
    if (!fire || used.current) return
    used.current = true

    // 동적 import로 SSR 문제 방지
    import('canvas-confetti').then(({ default: confetti }) => {
      let origin = { x: 0.5, y: 0.25 }
      if (targetId) {
        const el = document.getElementById(targetId)
        if (el) {
          const r = el.getBoundingClientRect()
          origin = {
            x: (r.left + r.width / 2) / window.innerWidth,
            y: Math.max(0.1, (r.top + 10) / window.innerHeight),
          }
        }
      }

      const end = Date.now() + 900
      ;(function frame() {
        confetti({
          particleCount: 4,
          startVelocity: 32,
          spread: 60,
          ticks: 60,
          origin,
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      })()
    })

    const t = setTimeout(() => (used.current = false), 1200)
    return () => clearTimeout(t)
  }, [fire, targetId, colors])

  return null
}