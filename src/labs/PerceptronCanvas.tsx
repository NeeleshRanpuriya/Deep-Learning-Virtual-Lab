import React, { useRef, useEffect, useState, useCallback } from 'react'

interface PerceptronCanvasProps {
  inputs: number[]
  weights: number[]
  bias: number
  activation: string
  output: number
  animating: boolean
}

export default function PerceptronCanvas({ inputs, weights, bias, activation, output, animating }: PerceptronCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    let raf: number
    let t = 0

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, W, H)

      const inputX = 80
      const outputX = W - 80
      const centerY = H / 2
      const inputCount = inputs.length
      const spacing = Math.min(60, (H - 60) / Math.max(inputCount - 1, 1))
      const startY = centerY - (inputCount - 1) * spacing / 2
      const R = 22

      // Draw connections
      inputs.forEach((inp, i) => {
        const fromY = startY + i * spacing
        const w = weights[i] ?? 0
        const wAbs = Math.min(Math.abs(w), 1)
        const active = animating && t > i * 0.15 && t < i * 0.15 + 0.6

        ctx.beginPath()
        ctx.moveTo(inputX + R, fromY)
        ctx.lineTo(outputX - R, centerY)

        if (active) {
          ctx.strokeStyle = w >= 0 ? `rgba(59,130,246,${0.4 + wAbs * 0.5})` : `rgba(239,68,68,${0.4 + wAbs * 0.5})`
          ctx.lineWidth = 1 + wAbs * 3
        } else {
          ctx.strokeStyle = `rgba(100,116,139,${0.2 + wAbs * 0.2})`
          ctx.lineWidth = 0.5 + wAbs * 2
        }
        ctx.stroke()

        // Signal dot
        if (active) {
          const prog = Math.min((t - i * 0.15) / 0.6, 1)
          const dotX = inputX + R + (outputX - R - inputX - R) * prog
          const dotY = fromY + (centerY - fromY) * prog
          ctx.beginPath()
          ctx.arc(dotX, dotY, 5, 0, Math.PI * 2)
          ctx.fillStyle = '#60a5fa'
          ctx.shadowColor = '#3b82f6'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Weight label on connection
        const midX = (inputX + R + outputX - R) / 2
        const midY = (fromY + centerY) / 2
        ctx.fillStyle = '#64748b'
        ctx.font = '10px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`w=${w.toFixed(2)}`, midX, midY - 6)
      })

      // Draw input neurons
      inputs.forEach((inp, i) => {
        const iy = startY + i * spacing
        ctx.beginPath()
        ctx.arc(inputX, iy, R, 0, Math.PI * 2)
        const active = animating && t > i * 0.15
        ctx.fillStyle = active ? '#1d4ed8' : '#1e293b'
        ctx.fill()
        ctx.strokeStyle = active ? '#3b82f6' : '#334155'
        ctx.lineWidth = 2
        ctx.stroke()
        if (active) {
          ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 12
          ctx.beginPath(); ctx.arc(inputX, iy, R, 0, Math.PI * 2); ctx.stroke()
          ctx.shadowBlur = 0
        }
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`x${i+1}=${inp.toFixed(1)}`, inputX, iy + 4)
        ctx.fillStyle = '#64748b'
        ctx.font = '10px sans-serif'
        ctx.fillText(`Input ${i+1}`, inputX, iy - R - 5)
      })

      // Bias node (small node below)
      const biasY = centerY + 70
      const biasActive = animating && t > 0.8
      ctx.beginPath()
      ctx.arc(outputX - 50, biasY, 14, 0, Math.PI * 2)
      ctx.fillStyle = biasActive ? '#312e81' : '#1e293b'
      ctx.fill()
      ctx.strokeStyle = biasActive ? '#818cf8' : '#334155'
      ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('b', outputX - 50, biasY + 4)
      // Bias line
      ctx.beginPath()
      ctx.moveTo(outputX - 50, biasY - 14)
      ctx.lineTo(outputX - R, centerY)
      ctx.strokeStyle = biasActive ? 'rgba(129,140,248,0.6)' : 'rgba(100,116,139,0.2)'
      ctx.lineWidth = 1; ctx.stroke()
      ctx.fillStyle = '#64748b'; ctx.font = '9px monospace'
      ctx.fillText(`b=${bias.toFixed(2)}`, outputX - 50, biasY + 22)

      // Summation node
      const sumX = outputX - 70
      ctx.beginPath()
      ctx.arc(sumX, centerY, 18, 0, Math.PI * 2)
      ctx.fillStyle = animating && t > 0.9 ? '#164e63' : '#162032'
      ctx.fill(); ctx.strokeStyle = '#0891b2'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.fillStyle = '#67e8f9'; ctx.font = 'bold 14px serif'; ctx.textAlign = 'center'
      ctx.fillText('Σ', sumX, centerY + 5)

      // Arrow to activation
      ctx.beginPath()
      ctx.moveTo(sumX + 18, centerY); ctx.lineTo(outputX - R - 10, centerY)
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke()
      // Arrow head
      ctx.beginPath()
      ctx.moveTo(outputX - R - 10, centerY)
      ctx.lineTo(outputX - R - 16, centerY - 5)
      ctx.lineTo(outputX - R - 16, centerY + 5)
      ctx.closePath(); ctx.fillStyle = '#334155'; ctx.fill()

      // Activation label
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText(activation, (sumX + 18 + outputX - R - 10) / 2, centerY - 10)

      // Output neuron
      const allDone = animating && t > 1.1
      ctx.beginPath()
      ctx.arc(outputX, centerY, R + 4, 0, Math.PI * 2)
      ctx.fillStyle = allDone ? '#172554' : '#0f172a'; ctx.fill()
      ctx.beginPath()
      ctx.arc(outputX, centerY, R, 0, Math.PI * 2)
      ctx.fillStyle = allDone ? '#2563eb' : '#1e293b'; ctx.fill()
      ctx.strokeStyle = allDone ? '#60a5fa' : '#334155'
      ctx.lineWidth = 2
      if (allDone) { ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 20 }
      ctx.stroke(); ctx.shadowBlur = 0
      ctx.fillStyle = '#e2e8f0'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(output.toFixed(3), outputX, centerY + 3)
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'
      ctx.fillText('Output', outputX, centerY - R - 8)
    }

    function animate() {
      if (animating) {
        t = Math.min(t + 0.02, 1.5)
        if (t >= 1.5) t = 0
      } else {
        t = 0
      }
      draw()
      raf = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(raf)
  }, [inputs, weights, bias, activation, output, animating])

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={320}
      className="w-full h-full"
      style={{ imageRendering: 'crisp-edges', backgroundColor: '#000' }}
    />
  )
}
