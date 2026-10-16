'use client'

import { useEffect, useRef } from 'react'

const LEAF_COLORS = ['#D13E2E', '#DF9A67', '#C75A32', '#E07A5F', '#B54728']

interface Leaf {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  angle: number
  spin: number
  swaySpeed: number
  swayOffset: number
}

function makeLeaf(width: number, height: number, scatter: boolean): Leaf {
  const scale = Math.random()
  return {
    x: Math.random() * width,
    // On first paint leaves are scattered over the screen; respawns start just above it.
    y: scatter ? Math.random() * height : -15,
    vx: (Math.random() - 0.2) * 0.6,
    vy: 0.6 + Math.random() * 0.6,
    size: 8 + scale * 7,
    color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.035,
    swaySpeed: 0.015 + Math.random() * 0.02,
    swayOffset: Math.random() * 100,
  }
}

/** Seven-pointed maple leaf, stem down, centred on the origin. */
function drawLeaf(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath()
  ctx.moveTo(0, s)
  ctx.lineTo(0, s * 0.2)
  ctx.lineTo(-s * 0.4, s * 0.35)
  ctx.lineTo(-s * 0.25, 0)
  ctx.lineTo(-s * 0.9, -s * 0.15)
  ctx.lineTo(-s * 0.45, -s * 0.4)
  ctx.lineTo(-s * 0.65, -s * 0.8)
  ctx.lineTo(-s * 0.2, -s * 0.55)
  ctx.lineTo(0, -s * 1.15)
  ctx.lineTo(s * 0.2, -s * 0.55)
  ctx.lineTo(s * 0.65, -s * 0.8)
  ctx.lineTo(s * 0.45, -s * 0.4)
  ctx.lineTo(s * 0.9, -s * 0.15)
  ctx.lineTo(s * 0.25, 0)
  ctx.lineTo(s * 0.4, s * 0.35)
  ctx.closePath()
  ctx.fill()
}

/**
 * Maple leaves drifting down the viewport on a fixed canvas. Pauses while the
 * tab is hidden and doesn't run at all under prefers-reduced-motion.
 */
export default function AutumnLeaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let leaves: Leaf[] = []
    let frame: number | null = null

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = canvas.width < 768 ? 7 : 14
      leaves = Array.from({ length: count }, () => makeLeaf(canvas.width, canvas.height, true))
    }

    const tick = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < leaves.length; i++) {
        const leaf = leaves[i]
        leaf.swayOffset += leaf.swaySpeed
        leaf.x += leaf.vx + Math.sin(leaf.swayOffset) * 0.5
        leaf.y += leaf.vy
        leaf.angle += leaf.spin

        if (leaf.y > height + 15 || leaf.x < -15 || leaf.x > width + 15) {
          leaves[i] = makeLeaf(width, height, false)
          continue
        }

        ctx.save()
        ctx.translate(leaf.x, leaf.y)
        ctx.rotate(leaf.angle)
        ctx.fillStyle = leaf.color
        drawLeaf(ctx, leaf.size)
        ctx.restore()
      }

      frame = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (frame !== null) cancelAnimationFrame(frame)
        frame = null
      } else if (frame === null) {
        frame = requestAnimationFrame(tick)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibility)
    frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}
