import React, { useRef, useEffect } from 'react'
import { activations, activationDerivatives, ActivationFn } from '../utils/nnEngine'

interface ActivationChartProps {
  fn: ActivationFn
  width?: number
  height?: number
}

export default function ActivationChart({ fn, width = 280, height = 160 }: ActivationChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, W, H)

    const xMin = -4, xMax = 4
    const yMin = -1.5, yMax = 1.5
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * W
    const toCanvasY = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H

    // Grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    for (let x = xMin; x <= xMax; x++) {
      ctx.beginPath(); ctx.moveTo(toCanvasX(x), 0); ctx.lineTo(toCanvasX(x), H); ctx.stroke()
    }
    for (let y = yMin; y <= yMax; y += 0.5) {
      ctx.beginPath(); ctx.moveTo(0, toCanvasY(y)); ctx.lineTo(W, toCanvasY(y)); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(0, toCanvasY(0)); ctx.lineTo(W, toCanvasY(0)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(toCanvasX(0), 0); ctx.lineTo(toCanvasX(0), H); ctx.stroke()

    // Derivative
    ctx.strokeStyle = 'rgba(249,115,22,0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let px = 0; px < W; px++) {
      const x = xMin + (px / W) * (xMax - xMin)
      const y = activationDerivatives[fn](x)
      const cy = toCanvasY(y)
      if (px === 0) ctx.moveTo(px, cy); else ctx.lineTo(px, cy)
    }
    ctx.stroke()

    // Activation function
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let px = 0; px < W; px++) {
      const x = xMin + (px / W) * (xMax - xMin)
      const y = activations[fn](x)
      const cy = toCanvasY(Math.max(yMin, Math.min(yMax, y)))
      if (px === 0) ctx.moveTo(px, cy); else ctx.lineTo(px, cy)
    }
    ctx.stroke()

    // Labels
    ctx.font = '10px monospace'
    ctx.fillStyle = '#94a3b8'
    ctx.textAlign = 'left'
    ctx.fillText('f(x)', 6, 14)
    ctx.fillStyle = '#f97316'
    ctx.fillText("f'(x)", 6, 26)
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'
    ctx.fillText(fn.toUpperCase(), W / 2, H - 4)
  }, [fn, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full rounded-lg"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}
