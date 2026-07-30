'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ParticleCanvasProps {
  count?: number
  magnetRadius?: number
  ringRadius?: number
  waveSpeed?: number
  waveAmplitude?: number
  particleSize?: number
  lerpSpeed?: number
  autoAnimate?: boolean
  pulseSpeed?: number
  fieldStrength?: number
  className?: string
}

interface Particle {
  // Origin / resting position
  ox: number
  oy: number
  // Current drawn position
  cx: number
  cy: number
  // Target position (lerp destination)
  tx: number
  ty: number
  // Phase offset for wave / pulse animation
  phase: number
  speed: number
  // Random scatter for ring deviation
  radiusOffset: number
  // Capsule rotation angle (in radians)
  angle: number
  // Current scale (for pulse)
  scale: number
}

export default function ParticleCanvas({
  count = 280,
  magnetRadius = 130,
  ringRadius = 55,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 2,
  lerpSpeed = 0.055,
  autoAnimate = true,
  pulseSpeed = 2.5,
  fieldStrength = 10,
  className = '',
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const virtualMouseRef = useRef({ x: -9999, y: -9999 })
  const lastMoveRef = useRef(0)
  const rafRef = useRef<number>(0)
  const colorRef = useRef('#ed475b')
  const rgbRef = useRef<[number, number, number]>([237, 71, 91])

  // Reads the current --color-accent CSS variable from the canvas element and parses RGB integers
  const refreshColor = useCallback(() => {
    if (!canvasRef.current) return
    const raw = getComputedStyle(canvasRef.current)
      .getPropertyValue('--color-accent')
      .trim()
    if (raw) {
      colorRef.current = raw
      rgbRef.current = parseRgb(raw)
    }
  }, [])

  // (Re-)initialise particles spread uniformly across the canvas
  const initParticles = useCallback((width: number, height: number) => {
    const effectiveCount = width < 768 ? Math.min(count, 180) : count
    const particles: Particle[] = []
    for (let i = 0; i < effectiveCount; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      particles.push({
        ox: x,
        oy: y,
        cx: x,
        cy: y,
        tx: x,
        ty: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.007,
        radiusOffset: (Math.random() - 0.5) * 2,
        angle: Math.random() * Math.PI * 2,
        scale: 1,
      })
    }
    particlesRef.current = particles
  }, [count])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // --- Sizing ---
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      refreshColor()
      initParticles(width, height)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    // --- Mouse ---
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      lastMoveRef.current = performance.now()
    }
    // Use the canvas's parent (the section) for mouse events so the full area is tracked
    const section = canvas.parentElement ?? canvas
    section.addEventListener('mousemove', onMouseMove)

    // Also listen for theme changes (class mutations on <html>) to refresh the accent color
    const themeObserver = new MutationObserver(refreshColor)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // --- Animation loop ---
    let elapsed = 0
    let lastTs = 0
    let running = false

    const draw = (ts: number) => {
      const dt = Math.min(ts - lastTs, 50) // cap dt to avoid huge jumps
      lastTs = ts
      elapsed += dt * 0.001 // seconds

      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Determine virtual mouse (auto-animate when idle)
      const idle = autoAnimate && performance.now() - lastMoveRef.current > 2000
      let destX: number, destY: number
      if (idle) {
        // Lissajous figure-8 path
        destX = width / 2 + Math.sin(elapsed * 0.5) * (width * 0.28)
        destY = height / 2 + Math.sin(elapsed * 1.0) * (height * 0.22)
      } else {
        destX = mouseRef.current.x
        destY = mouseRef.current.y
      }

      // Smooth virtual cursor
      const vm = virtualMouseRef.current
      vm.x += (destX - vm.x) * 0.05
      vm.y += (destY - vm.y) * 0.05

      const [r, g, b] = rgbRef.current

      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.phase += p.speed

        const dx = p.ox - vm.x
        const dy = p.oy - vm.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < magnetRadius) {
          // Orbit the cursor in a ring
          const orbitAngle = Math.atan2(dy, dx)
          const wave = Math.sin(p.phase * waveSpeed * 10 + orbitAngle) * (0.5 * waveAmplitude)
          const deviation = p.radiusOffset * (5 / (fieldStrength + 0.1))
          const r = ringRadius + wave + deviation

          p.tx = vm.x + r * Math.cos(orbitAngle)
          p.ty = vm.y + r * Math.sin(orbitAngle)

          // Face the cursor
          p.angle = orbitAngle + Math.PI / 2
        } else {
          // Return to origin with slow drift
          p.tx = p.ox + Math.sin(p.phase * 0.8 + i) * 4
          p.ty = p.oy + Math.cos(p.phase * 0.6 + i) * 4
          p.angle += 0.01
        }

        // Lerp current position toward target
        p.cx += (p.tx - p.cx) * lerpSpeed
        p.cy += (p.ty - p.cy) * lerpSpeed

        // Pulse scale
        const distFromRing = Math.abs(dist - ringRadius)
        const proximity = dist < magnetRadius ? Math.max(0, 1 - distFromRing / 15) : 0
        const pulse = 0.7 + Math.sin(p.phase * pulseSpeed) * 0.3
        p.scale = (0.5 + proximity * 0.5) * pulse

        const s = particleSize * p.scale
        if (s < 0.15) continue // skip invisible particles

        // Draw capsule (pill shape): a rounded rect
        const capLen = s * 2.2
        const capRad = s * 0.65

        ctx.save()
        ctx.translate(p.cx, p.cy)
        ctx.rotate(p.angle)

        ctx.beginPath()
        // Rounded rect approximation of a capsule
        ctx.roundRect(-capLen / 2, -capRad, capLen, capRad * 2, capRad)

        // Opacity varies with scale for a depth-of-field feel
        const alpha = 0.3 + p.scale * 0.55
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        ctx.restore()
      }

      if (running) rafRef.current = requestAnimationFrame(draw)
    }

    // --- Visibility gating: only run the RAF loop while on-screen ---
    const startLoop = () => {
      if (running) return
      running = true
      lastTs = 0 // reset so the resumed frame doesn't see a huge dt gap
      rafRef.current = requestAnimationFrame(draw)
    }
    const stopLoop = () => {
      running = false
      cancelAnimationFrame(rafRef.current)
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoop()
        else stopLoop()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      stopLoop()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      section.removeEventListener('mousemove', onMouseMove)
    }
  }, [count, magnetRadius, ringRadius, waveSpeed, waveAmplitude, particleSize, lerpSpeed, autoAnimate, pulseSpeed, fieldStrength, initParticles, refreshColor])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}

// Utility: parse hex (#rrggbb or rgb(r,g,b)) to RGB tuple
function parseRgb(colorStr: string): [number, number, number] {
  if (colorStr.startsWith('rgb')) {
    const matches = colorStr.match(/\d+/g)
    if (matches && matches.length >= 3) {
      return [parseInt(matches[0], 10), parseInt(matches[1], 10), parseInt(matches[2], 10)]
    }
  }
  const clean = colorStr.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return [237, 71, 91]
  return [r, g, b]
}
