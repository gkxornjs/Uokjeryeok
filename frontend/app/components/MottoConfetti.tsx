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
  const once = useRef(false)

  useEffect(() => {
    if (!fire || once.current) return
    once.current = true

    // target 엘리먼트 중심 기준으로 origin 계산
    const rect = targetId ? document.getElementById(targetId)?.getBoundingClientRect() : undefined
    const origin = rect
      ? {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: Math.max(0.1, (rect.top + 10) / window.innerHeight),
        }
      : { x: 0.5, y: 0.25 }

    const end = Date.now() + 900
    ;(function frame() {
      confetti({
        particleCount: 3,
        startVelocity: 32,
        spread: 55,
        ticks: 60,
        origin,
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()

    // 한 번만 터지도록 리셋
    const t = setTimeout(() => (once.current = false), 1200)
    return () => clearTimeout(t)
  }, [fire, targetId, colors])

  return null
}
