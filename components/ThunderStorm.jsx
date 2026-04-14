import { useEffect, useRef, useCallback } from 'react'
import styles from '../styles/ThunderStorm.module.css'

function generateLightning(segments, x1, y1, x2, y2, disp, minDisp, isBranch = false) {
  if (disp < minDisp) {
    segments.push({ x1, y1, x2, y2, isBranch })
    return
  }
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * disp
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * disp
  generateLightning(segments, x1, y1, mx, my, disp / 2, minDisp, isBranch)
  generateLightning(segments, mx, my, x2, y2, disp / 2, minDisp, isBranch)
  if (!isBranch && Math.random() > 0.58) {
    const bx = mx + (Math.random() - 0.5) * disp * 1.6
    const by = my + Math.random() * disp * 1.4
    generateLightning(segments, mx, my, bx, by, disp / 2.5, minDisp, true)
  }
}

function drawLayer(ctx, segments, color, width, blur) {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.shadowBlur = blur
  ctx.shadowColor = color
  segments.forEach(({ x1, y1, x2, y2 }) => {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
  })
  ctx.stroke()
}

export function ThunderStorm() {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const animRef = useRef(null)
  const loopTimeoutRef = useRef(null)

  const triggerStrike = useCallback(() => {
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    if (!canvas || !overlay) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    const startX = canvas.width * (0.15 + Math.random() * 0.7)
    const endX = startX + (Math.random() - 0.5) * 280
    const endY = canvas.height * (0.45 + Math.random() * 0.45)

    const segments = []
    generateLightning(segments, startX, 0, endX, endY, 200, 4)

    const renderFrame = (alpha) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = alpha
      // Outer purple halo
      drawLayer(ctx, segments, 'rgba(160, 60, 255, 0.45)', 10, 60)
      // Blue-purple glow
      drawLayer(ctx, segments, 'rgba(100, 150, 255, 0.75)', 5, 35)
      // Bright blue-white
      drawLayer(ctx, segments, 'rgba(200, 220, 255, 0.95)', 2.5, 18)
      // Pure white core
      drawLayer(ctx, segments, 'rgba(255, 255, 255, 1)', 1.2, 6)
      ctx.globalAlpha = 1
    }

    // Initial bright flash
    renderFrame(1)

    // Flash overlay
    overlay.style.transition = 'none'
    overlay.style.opacity = '0.6'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.45s ease-out'
        overlay.style.opacity = '0'
      })
    })

    // Fade out canvas via rAF
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const startTime = performance.now()
    const duration = 650
    const fade = (now) => {
      const elapsed = now - startTime
      const alpha = Math.max(0, 1 - elapsed / duration)
      renderFrame(alpha)
      if (alpha > 0) {
        animRef.current = requestAnimationFrame(fade)
      }
    }
    animRef.current = requestAnimationFrame(fade)
  }, [])

  useEffect(() => {
    const scheduleLoop = () => {
      const delay = 2800 + Math.random() * 6500
      loopTimeoutRef.current = setTimeout(() => {
        triggerStrike()
        // Double strike ~50% of the time
        if (Math.random() > 0.5) {
          setTimeout(triggerStrike, 100 + Math.random() * 160)
        }
        // Triple strike ~20% of the time
        if (Math.random() > 0.8) {
          setTimeout(triggerStrike, 320 + Math.random() * 200)
        }
        scheduleLoop()
      }, delay)
    }

    const initialTimeout = setTimeout(triggerStrike, 700)
    scheduleLoop()

    return () => {
      clearTimeout(initialTimeout)
      clearTimeout(loopTimeoutRef.current)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [triggerStrike])

  return (
    <>
      <canvas ref={canvasRef} className={styles.lightning} />
      <div ref={overlayRef} className={styles.flashOverlay} />
    </>
  )
}
