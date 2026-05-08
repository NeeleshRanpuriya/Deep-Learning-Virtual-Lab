import React, { useRef, useEffect, useCallback, useState } from 'react'

interface NNCanvasProps {
  layers: number[]           // [inputSize, h1, h2, ..., outputSize]
  activations: number[][]    // per-layer activation values
  weights: number[][][]      // per-layer weight matrices [inIdx][outIdx]
  signalPhase: 'idle' | 'forward' | 'backward'
  signalProgress: number     // 0..1
  hoveredNeuron: { layer: number; idx: number } | null
  onNeuronHover: (n: { layer: number; idx: number } | null) => void
}

const COLORS = {
  bg: '#0f172a',
  neuronDefault: '#1e3a5f',
  neuronActive: '#3b82f6',
  neuronGlow: '#60a5fa',
  connectionDefault: '#1e293b',
  connectionActive: '#3b82f6',
  connectionBack: '#f97316',
  text: '#94a3b8',
  bias: '#334155',
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }

function getColor(value: number): string {
  const v = clamp(value, -1, 1)
  if (v >= 0) {
    const t = v
    const r = Math.round(59 + t * (96 - 59))
    const g = Math.round(130 + t * (165 - 130))
    const b = Math.round(246 + t * (250 - 246))
    return `rgb(${r},${g},${b})`
  } else {
    const t = -v
    const r = Math.round(59 + t * (249 - 59))
    const g = Math.round(130 + t * (115 - 130))
    const b = Math.round(246 + t * (22 - 246))
    return `rgb(${r},${g},${b})`
  }
}

export default function NeuralNetCanvas({
  layers,
  activations,
  weights,
  signalPhase,
  signalProgress,
  hoveredNeuron,
  onNeuronHover,
}: NNCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tooltipRef = useRef<{ x: number; y: number; text: string } | null>(null)

  const MAX_VISIBLE = 8

  const getNeuronPositions = useCallback((width: number, height: number) => {
    const positions: { x: number; y: number }[][] = []
    const layerCount = layers.length
    const xPad = 60
    const xStep = (width - xPad * 2) / Math.max(layerCount - 1, 1)

    layers.forEach((n, li) => {
      const visible = Math.min(n, MAX_VISIBLE)
      const yPad = 40
      const yStep = (height - yPad * 2) / Math.max(visible - 1, 1)
      const layerPos: { x: number; y: number }[] = []
      for (let ni = 0; ni < visible; ni++) {
        layerPos.push({
          x: xPad + li * xStep,
          y: visible === 1 ? height / 2 : yPad + ni * yStep,
        })
      }
      positions.push(layerPos)
    })
    return positions
  }, [layers])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = COLORS.bg
    ctx.fillRect(0, 0, W, H)

    const positions = getNeuronPositions(W, H)
    const R = Math.max(8, Math.min(16, 200 / Math.max(...layers)))

    // Draw connections
    for (let li = 0; li < positions.length - 1; li++) {
      const from = positions[li]
      const to = positions[li + 1]
      from.forEach((fp, fi) => {
        to.forEach((tp, ti) => {
          const w = weights[li]?.[fi]?.[ti] ?? 0
          const intensity = clamp(Math.abs(w), 0, 1)
          const isForwardActive = signalPhase === 'forward' && li < signalProgress * (layers.length - 1)
          const isBackActive = signalPhase === 'backward' && li >= signalProgress * (layers.length - 1)

          ctx.beginPath()
          ctx.moveTo(fp.x, fp.y)
          ctx.lineTo(tp.x, tp.y)

          if (isForwardActive) {
            ctx.strokeStyle = `rgba(59,130,246,${0.3 + intensity * 0.5})`
            ctx.lineWidth = 0.5 + intensity * 2
          } else if (isBackActive) {
            ctx.strokeStyle = `rgba(249,115,22,${0.3 + intensity * 0.4})`
            ctx.lineWidth = 0.5 + intensity * 1.5
          } else {
            ctx.strokeStyle = `rgba(148,163,184,${0.08 + intensity * 0.12})`
            ctx.lineWidth = 0.5 + intensity
          }
          ctx.stroke()
        })
      })
    }

    // Animate signal dots (forward)
    if (signalPhase === 'forward' || signalPhase === 'backward') {
      const totalConnections = layers.length - 1
      const activeLayer = Math.floor(signalProgress * totalConnections)
      const layerProgress = (signalProgress * totalConnections) - activeLayer

      if (activeLayer < totalConnections) {
        const fromLayer = signalPhase === 'forward' ? activeLayer : totalConnections - 1 - activeLayer
        const toLayerIdx = signalPhase === 'forward' ? fromLayer + 1 : fromLayer - 1
        if (fromLayer >= 0 && toLayerIdx >= 0 && toLayerIdx < positions.length) {
          const fromPos = positions[fromLayer]
          const toPos = positions[toLayerIdx]
          const dotColor = signalPhase === 'forward' ? '#60a5fa' : '#fb923c'
          fromPos.slice(0, 3).forEach((fp) => {
            toPos.slice(0, 3).forEach((tp) => {
              const x = fp.x + (tp.x - fp.x) * layerProgress
              const y = fp.y + (tp.y - fp.y) * layerProgress
              ctx.beginPath()
              ctx.arc(x, y, 3, 0, Math.PI * 2)
              ctx.fillStyle = dotColor
              ctx.fill()
              ctx.shadowColor = dotColor
              ctx.shadowBlur = 8
              ctx.fill()
              ctx.shadowBlur = 0
            })
          })
        }
      }
    }

    // Draw neurons
    positions.forEach((layerPos, li) => {
      const n = layers[li]
      const visible = Math.min(n, MAX_VISIBLE)
      const labelY = layerPos[0].y - R - 10
      const labelX = layerPos[0].x
      ctx.fillStyle = COLORS.text
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      const layerLabel = li === 0 ? 'Input' : li === layers.length - 1 ? 'Output' : `H${li}`
      ctx.fillText(layerLabel, labelX, labelY)
      ctx.fillText(`(${n})`, labelX, labelY + 11)

      layerPos.forEach((pos, ni) => {
        const actVal = activations[li]?.[ni] ?? 0
        const isHovered = hoveredNeuron?.layer === li && hoveredNeuron?.idx === ni
        const isActive = signalPhase === 'forward' && li <= signalProgress * (layers.length - 1)
        const isBackActive = signalPhase === 'backward' && li >= signalProgress * (layers.length - 1)

        // Glow for active neurons
        if (isActive || isBackActive) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, R + 4, 0, Math.PI * 2)
          const glowColor = isActive ? 'rgba(59,130,246,0.2)' : 'rgba(249,115,22,0.2)'
          ctx.fillStyle = glowColor
          ctx.fill()
        }

        // Neuron circle
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2)
        const fillColor = (isActive || isBackActive) ? getColor(actVal) : '#1e293b'
        ctx.fillStyle = isHovered ? '#60a5fa' : fillColor
        ctx.fill()
        ctx.strokeStyle = isHovered ? '#93c5fd' : (isActive ? '#3b82f6' : '#334155')
        ctx.lineWidth = isHovered ? 2.5 : 1.5
        ctx.stroke()

        // Activation value text
        if (R > 10) {
          ctx.fillStyle = '#e2e8f0'
          ctx.font = `${Math.max(7, R * 0.5)}px monospace`
          ctx.textAlign = 'center'
          ctx.fillText(actVal.toFixed(2), pos.x, pos.y + 3)
        }

        // Hover tooltip trigger
        if (isHovered) {
          tooltipRef.current = {
            x: pos.x,
            y: pos.y - R - 8,
            text: `L${li}·N${ni}: a=${actVal.toFixed(4)}`,
          }
        }
      })

      // Ellipsis if truncated
      if (n > MAX_VISIBLE) {
        const last = layerPos[layerPos.length - 1]
        ctx.fillStyle = '#475569'
        ctx.font = '12px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('···', last.x, last.y + R + 14)
      }
    })

    // Tooltip
    if (hoveredNeuron && tooltipRef.current) {
      const t = tooltipRef.current
      const pad = 6
      ctx.font = '11px monospace'
      const tw = ctx.measureText(t.text).width + pad * 2
      const th = 18
      ctx.fillStyle = 'rgba(30,41,59,0.95)'
      roundRect(ctx, t.x - tw / 2, t.y - th, tw, th, 4)
      ctx.fill()
      ctx.fillStyle = '#e2e8f0'
      ctx.textAlign = 'center'
      ctx.fillText(t.text, t.x, t.y - 5)
    }

    // Legend
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ctx.fillStyle = '#475569'
    const legendY = H - 10
    const fwdColor = '#3b82f6', bkColor = '#f97316'
    ctx.fillStyle = fwdColor
    ctx.fillRect(8, legendY - 8, 12, 4)
    ctx.fillStyle = '#64748b'
    ctx.fillText('Forward', 24, legendY - 5)
    ctx.fillStyle = bkColor
    ctx.fillRect(90, legendY - 8, 12, 4)
    ctx.fillStyle = '#64748b'
    ctx.fillText('Backward', 106, legendY - 5)
  }, [layers, activations, weights, signalPhase, signalProgress, hoveredNeuron, getNeuronPositions])

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    const positions = getNeuronPositions(canvas.width, canvas.height)
    const R = Math.max(8, Math.min(16, 200 / Math.max(...layers)))

    let found: { layer: number; idx: number } | null = null
    positions.forEach((layerPos, li) => {
      layerPos.forEach((pos, ni) => {
        const d = Math.hypot(mx - pos.x, my - pos.y)
        if (d < R + 4) found = { layer: li, idx: ni }
      })
    })
    onNeuronHover(found)
  }, [layers, getNeuronPositions, onNeuronHover])

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={380}
      className="w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onNeuronHover(null)}
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}
