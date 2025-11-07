'use client'
import { useEffect, useRef } from 'react'

export default function MottoConfetti({
  fire,
  targetId,
}: {
  fire: boolean
  targetId?: string
}) {
  const used = useRef(false)

  useEffect(() => {
    if (!fire || used.current) return
    used.current = true

    import('canvas-confetti').then(({ default: confetti }) => {
      // 전용 canvas 생성 (z-index 올려서 항상 위로)
      const canvas = document.createElement('canvas')
      canvas.style.position = 'fixed'
      canvas.style.inset = '0'
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.pointerEvents = 'none'
      canvas.style.zIndex = '99999'
      document.body.appendChild(canvas)

      const launcher = confetti.create(canvas, { resize: true, useWorker: true })

      let origin = { x: 0.5, y: 0.25 }
      const el = targetId ? document.getElementById(targetId) : null
      if (el) {
        const r = el.getBoundingClientRect()
        origin = {
          x: (r.left + r.width / 2) / window.innerWidth,
          y: Math.max(0.1, (r.top + 10) / window.innerHeight),
        }
      }

      const end = Date.now() + 900
      ;(function frame() {
        launcher({ particleCount: 5, startVelocity: 32, spread: 60, ticks: 60, origin })
        if (Date.now() < end) requestAnimationFrame(frame)
      })()

      setTimeout(() => {
        try { canvas.remove() } catch {}
        used.current = false
      }, 1200)
    })
  }, [fire, targetId])

  return null
}
