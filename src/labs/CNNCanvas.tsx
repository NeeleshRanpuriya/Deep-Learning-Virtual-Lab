import React, { useRef, useEffect, useState } from 'react'

type CNNModel = 'alexnet' | 'resnet' | 'densenet' | 'pixelnet'

interface CNNBlock {
  label: string
  color: string
  width: number
  height: number
  sublabel?: string
}

const MODEL_CONFIGS: Record<CNNModel, CNNBlock[]> = {
  alexnet: [
    { label: 'Input\n227×227×3', color: '#1e3a5f', width: 40, height: 100 },
    { label: 'Conv1\n96 filters\n11×11', color: '#1e4d6b', width: 36, height: 90, sublabel: 'ReLU' },
    { label: 'Pool1\n3×3', color: '#1a3a4f', width: 28, height: 78, sublabel: 'Max' },
    { label: 'Conv2\n256 filters\n5×5', color: '#1e4d6b', width: 26, height: 72, sublabel: 'ReLU' },
    { label: 'Pool2\n3×3', color: '#1a3a4f', width: 20, height: 60, sublabel: 'Max' },
    { label: 'Conv3\n384 filters\n3×3', color: '#1e4d6b', width: 18, height: 56, sublabel: 'ReLU' },
    { label: 'Conv4\n384 filters\n3×3', color: '#1e4d6b', width: 18, height: 56, sublabel: 'ReLU' },
    { label: 'Conv5\n256 filters\n3×3', color: '#1e4d6b', width: 18, height: 52, sublabel: 'ReLU' },
    { label: 'Pool3\n3×3', color: '#1a3a4f', width: 14, height: 44, sublabel: 'Max' },
    { label: 'FC1\n4096', color: '#1e293b', width: 20, height: 80 },
    { label: 'FC2\n4096', color: '#1e293b', width: 20, height: 80 },
    { label: 'Output\n1000', color: '#14532d', width: 20, height: 100 },
  ],
  resnet: [
    { label: 'Input\n224×224', color: '#1e3a5f', width: 40, height: 100 },
    { label: 'Conv\n64 filters\n7×7 s2', color: '#1e4d6b', width: 34, height: 90, sublabel: 'BN+ReLU' },
    { label: 'Pool\n3×3 s2', color: '#1a3a4f', width: 28, height: 80, sublabel: 'Max' },
    { label: 'ResBlock\n64×3', color: '#312e81', width: 30, height: 88, sublabel: 'Skip +' },
    { label: 'ResBlock\n128×4', color: '#312e81', width: 26, height: 76, sublabel: 'Skip +' },
    { label: 'ResBlock\n256×6', color: '#312e81', width: 22, height: 64, sublabel: 'Skip +' },
    { label: 'ResBlock\n512×3', color: '#312e81', width: 18, height: 52, sublabel: 'Skip +' },
    { label: 'AvgPool\nGlobal', color: '#1a3a4f', width: 16, height: 40, sublabel: 'GAP' },
    { label: 'FC\n1000', color: '#14532d', width: 20, height: 100 },
  ],
  densenet: [
    { label: 'Input\n224×224', color: '#1e3a5f', width: 40, height: 100 },
    { label: 'Conv\n2k filters\n7×7', color: '#1e4d6b', width: 34, height: 90, sublabel: 'Init' },
    { label: 'Dense\nBlock 1\n6 layers', color: '#7c3aed', width: 32, height: 86, sublabel: 'k=32' },
    { label: 'Trans\nLayer 1', color: '#4338ca', width: 24, height: 68, sublabel: '÷2' },
    { label: 'Dense\nBlock 2\n12 layers', color: '#7c3aed', width: 28, height: 78, sublabel: 'k=32' },
    { label: 'Trans\nLayer 2', color: '#4338ca', width: 20, height: 58, sublabel: '÷2' },
    { label: 'Dense\nBlock 3\n24 layers', color: '#7c3aed', width: 24, height: 68, sublabel: 'k=32' },
    { label: 'Trans\nLayer 3', color: '#4338ca', width: 18, height: 50, sublabel: '÷2' },
    { label: 'Dense\nBlock 4\n16 layers', color: '#7c3aed', width: 20, height: 56, sublabel: 'k=32' },
    { label: 'AvgPool\n+Softmax', color: '#14532d', width: 20, height: 100 },
  ],
  pixelnet: [
    { label: 'Input\nImage', color: '#1e3a5f', width: 38, height: 100 },
    { label: 'Conv\nBackbone\nExtract', color: '#1e4d6b', width: 32, height: 90, sublabel: 'Multi-scale' },
    { label: 'Hyper\nColumn\nSample', color: '#7c3aed', width: 30, height: 84, sublabel: 'All layers' },
    { label: 'MLP\nProcess\n2048', color: '#1e293b', width: 26, height: 72, sublabel: 'ReLU' },
    { label: 'MLP\n1024', color: '#1e293b', width: 22, height: 64, sublabel: 'ReLU' },
    { label: 'Output\nPixel\nPred', color: '#14532d', width: 20, height: 100, sublabel: 'Per-pixel' },
  ],
}

interface CNNCanvasProps {
  model: CNNModel
  animating: boolean
  filterSize?: number
}

export default function CNNCanvas({ model, animating, filterSize = 3 }: CNNCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const blocks = MODEL_CONFIGS[model]
    const totalW = blocks.reduce((s, b) => s + b.width + 14, 0)
    const startX = Math.max(10, (W - totalW) / 2)

    function drawBlock(b: CNNBlock, x: number, idx: number, activeIdx: number) {
      const bh = b.height
      const by = (H - bh) / 2
      const isActive = animating && idx === activeIdx

      // Glow
      if (isActive) {
        ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 18
      }

      // 3D block (front face)
      ctx.fillStyle = isActive ? lighten(b.color, 40) : b.color
      ctx.fillRect(x, by, b.width, bh)
      ctx.strokeStyle = isActive ? '#60a5fa' : '#334155'
      ctx.lineWidth = isActive ? 2 : 1
      ctx.strokeRect(x, by, b.width, bh)
      ctx.shadowBlur = 0

      // Top face
      ctx.fillStyle = shiftColor(b.color, 20)
      ctx.beginPath()
      ctx.moveTo(x, by); ctx.lineTo(x + 8, by - 6)
      ctx.lineTo(x + b.width + 8, by - 6); ctx.lineTo(x + b.width, by)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 0.5; ctx.stroke()

      // Right face
      ctx.fillStyle = shiftColor(b.color, -10)
      ctx.beginPath()
      ctx.moveTo(x + b.width, by); ctx.lineTo(x + b.width + 8, by - 6)
      ctx.lineTo(x + b.width + 8, by + bh - 6); ctx.lineTo(x + b.width, by + bh)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#334155'; ctx.stroke()

      // Feature map lines (horizontal stripes on front)
      const stripeCount = Math.min(6, Math.floor(bh / 12))
      ctx.strokeStyle = `rgba(255,255,255,0.05)`;  ctx.lineWidth = 1
      for (let s = 1; s < stripeCount; s++) {
        ctx.beginPath()
        ctx.moveTo(x, by + s * bh / stripeCount)
        ctx.lineTo(x + b.width, by + s * bh / stripeCount)
        ctx.stroke()
      }

      // Label lines
      const lines = b.label.split('\n')
      ctx.fillStyle = isActive ? '#e2e8f0' : '#94a3b8'
      ctx.font = `${Math.max(7, Math.min(9, b.width * 0.28))}px monospace`
      ctx.textAlign = 'center'
      lines.forEach((line, li) => {
        ctx.fillText(line, x + b.width / 2, by + bh / 2 - (lines.length - 1) * 6 + li * 12)
      })
      if (b.sublabel) {
        ctx.fillStyle = '#f97316'; ctx.font = '8px monospace'
        ctx.fillText(b.sublabel, x + b.width / 2, by + bh / 2 + lines.length * 7)
      }

      // Signal particle on block
      if (isActive) {
        const t = tRef.current % 1
        const py = by + t * bh
        ctx.beginPath()
        ctx.arc(x + b.width / 2, py, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 10
        ctx.fill(); ctx.shadowBlur = 0
      }
    }

    function drawArrow(x1: number, y: number, x2: number) {
      ctx.beginPath()
      ctx.moveTo(x1, y); ctx.lineTo(x2 - 5, y)
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5; ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x2, y); ctx.lineTo(x2 - 7, y - 4); ctx.lineTo(x2 - 7, y + 4)
      ctx.closePath(); ctx.fillStyle = '#334155'; ctx.fill()
    }

    function lighten(hex: string, amt: number): string {
      const [r, g, b] = parseHex(hex)
      return `rgb(${Math.min(255, r + amt)},${Math.min(255, g + amt)},${Math.min(255, b + amt)})`
    }
    function shiftColor(hex: string, amt: number): string {
      const [r, g, b] = parseHex(hex)
      return `rgb(${clamp(r + amt)},${clamp(g + amt)},${clamp(b + amt)})`
    }
    function parseHex(hex: string): [number, number, number] {
      const v = hex.replace('#', '')
      return [parseInt(v.slice(0,2),16), parseInt(v.slice(2,4),16), parseInt(v.slice(4,6),16)]
    }
    function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)

      const totalBlocks = blocks.length
      const activeIdx = animating ? Math.floor(tRef.current * totalBlocks * 0.3) % totalBlocks : -1
      let cx = startX

      blocks.forEach((block, idx) => {
        const nextX = cx + block.width + 14
        drawBlock(block, cx, idx, activeIdx)
        if (idx < blocks.length - 1) {
          drawArrow(cx + block.width + 8, H / 2, nextX)
        }
        cx = nextX
      })

      // Model label
      ctx.fillStyle = '#475569'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'left'
      ctx.fillText(model.toUpperCase(), 10, 18)

      // Info line
      ctx.fillStyle = '#334155'; ctx.font = '10px monospace'; ctx.textAlign = 'right'
      ctx.fillText(`${blocks.length} layers`, W - 10, H - 8)
    }

    function animate() {
      if (animating) tRef.current += 0.015
      draw()
      rafRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(rafRef.current)
  }, [model, animating])

  return (
    <canvas
      ref={canvasRef}
      width={680}
      height={220}
      className="w-full rounded-lg"
      style={{ imageRendering: 'crisp-edges', backgroundColor: '#000' }}
    />
  )
}
