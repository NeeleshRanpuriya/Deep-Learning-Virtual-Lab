import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Slider, Select, ControlSection, Button, InfoBadge, ExplanationBox } from '../components/ControlPanel'
import LossChart from '../labs/LossChart'
import { Play, Pause, RotateCcw } from 'lucide-react'

type Lab2 = 'width_depth' | 'representation' | 'rbm' | 'autoencoder'

const LABS: { id: Lab2; label: string }[] = [
  { id: 'width_depth', label: 'Width vs Depth' },
  { id: 'representation', label: 'Representation Learning' },
  { id: 'rbm', label: 'RBM Visualizer' },
  { id: 'autoencoder', label: 'Basic Autoencoder' },
]

export default function Unit2Page() {
  const [activeLab, setActiveLab] = useState<Lab2>('width_depth')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const labParam = searchParams.get('lab')
    if (labParam) {
      const labMap: Record<string, Lab2> = {
        'width-vs-depth': 'width_depth',
        'representation-learning': 'representation',
        'rbm-visualizer': 'rbm',
        'basic-autoencoder': 'autoencoder',
      }
      const mappedLab = labMap[labParam] as Lab2
      if (mappedLab) setActiveLab(mappedLab)
    }
  }, [searchParams])

  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeInUp">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">Chapter II – Deep Network Architectures</h1>
        <p className="text-sm text-slate-500">Width vs Depth, Representation Learning, RBMs, Autoencoders</p>
      </div>
      {/* Lab tabs removed; lab displayed by activeLab or URL parameter */}
      {activeLab === 'width_depth' && <WidthDepthLab />}
      {activeLab === 'representation' && <RepresentationLab />}
      {activeLab === 'rbm' && <RBMLab />}
      {activeLab === 'autoencoder' && <AutoencoderLab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 1: Width vs Depth
// ─────────────────────────────────────────────
function WidthDepthLab() {
  const [width, setWidth] = useState(8)
  const [depth, setDepth] = useState(3)
  const [animating, setAnimating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const maxVisible = 10

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const totalLayers = depth + 2
      const xPad = 50
      const xStep = (W - xPad * 2) / Math.max(totalLayers - 1, 1)

      // Layer sizes: input(2) → hidden(width × depth) → output(1)
      const sizes = [2, ...Array(depth).fill(width), 1]
      const colors = ['#1e3a5f', ...Array(depth).fill('#312e81'), '#14532d']
      const borders = ['#3b82f6', ...Array(depth).fill('#818cf8'), '#10b981']

      sizes.forEach((size, li) => {
        const cx = xPad + li * xStep
        const visible = Math.min(size, maxVisible)
        const R = Math.max(7, Math.min(16, 240 / Math.max(visible, 1) / 3))
        const yStep = (H - 60) / Math.max(visible - 1, 1)
        const startY = 30 + (H - 60 - (visible - 1) * yStep) / 2
        const isActive = animating && li <= tRef.current * totalLayers * 0.3 % (totalLayers + 1)

        // Connections to next layer
        if (li < sizes.length - 1) {
          const nextSize = sizes[li + 1]
          const nextVisible = Math.min(nextSize, maxVisible)
          const nextR = Math.max(7, Math.min(16, 240 / Math.max(nextVisible, 1) / 3))
          const nextYStep = (H - 60) / Math.max(nextVisible - 1, 1)
          const nextStartY = 30 + (H - 60 - (nextVisible - 1) * nextYStep) / 2
          const nextCx = xPad + (li + 1) * xStep

          for (let ni = 0; ni < visible; ni++) {
            for (let nj = 0; nj < nextVisible; nj++) {
              const w = Math.sin(ni * 0.7 + nj * 0.4 + tRef.current) * 0.5 + 0.5
              ctx.beginPath()
              ctx.moveTo(cx, startY + ni * yStep)
              ctx.lineTo(nextCx, nextStartY + nj * nextYStep)
              ctx.strokeStyle = isActive ? `rgba(129,140,248,${0.15 + w * 0.2})` : `rgba(71,85,105,${0.05 + w * 0.08})`
              ctx.lineWidth = isActive ? 0.8 + w : 0.5; ctx.stroke()
            }
          }
        }

        // Neurons
        for (let ni = 0; ni < visible; ni++) {
          const ny = startY + ni * yStep
          const actV = isActive ? Math.max(0, Math.sin(tRef.current * 2 + ni * 0.5)) : 0
          ctx.beginPath(); ctx.arc(cx, ny, R, 0, Math.PI * 2)
          ctx.fillStyle = isActive ? colors[li].replace('1e', '2a') : colors[li]; ctx.fill()
          ctx.strokeStyle = isActive ? borders[li] : '#334155'; ctx.lineWidth = isActive ? 2 : 1.2; ctx.stroke()
          if (isActive && R > 8) {
            ctx.shadowColor = borders[li]; ctx.shadowBlur = 8
            ctx.beginPath(); ctx.arc(cx, ny, R, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0
          }
        }
        if (size > maxVisible) {
          ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
          ctx.fillText(`···+${size - maxVisible}`, cx, startY + visible * yStep + 10)
        }

        // Label
        const layerLabel = li === 0 ? 'Input\n(2)' : li === sizes.length - 1 ? 'Output\n(1)' : `H${li}\n(${size})`
        ctx.fillStyle = '#64748b'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
        layerLabel.split('\n').forEach((l, k) => ctx.fillText(l, cx, H - 16 + k * 10))
      })

      // Stats
      const totalParams = sizes.slice(1).reduce((s, sz, i) => s + (sizes[i] + 1) * sz, 0)
      ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`Depth: ${depth} | Width: ${width} | Params: ~${totalParams.toLocaleString()}`, 10, 14)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [width, depth, animating])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Network Shape">
          <Slider label="Width (neurons/layer)" value={width} min={1} max={32} onChange={setWidth} />
          <Slider label="Depth (hidden layers)" value={depth} min={1} max={8} onChange={setDepth} />
        </ControlSection>
        <div className="space-y-1.5 mb-3">
          <InfoBadge label="Total Layers" value={depth + 2} color="violet" />
          <InfoBadge label="Approx Params" value={(([2, ...Array(depth).fill(width), 1]).slice(1).reduce((s: number, sz: number, i: number, arr: number[]) => s + ((i === 0 ? 2 : arr[i - 1]) + 1) * sz, 0)).toLocaleString()} color="blue" />
        </div>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3">
          {animating ? <><Pause size={14} className="inline mr-1" />Pause</> : <><Play size={14} className="inline mr-1" />Animate</>}
        </Button>
        <ExplanationBox>
          <strong>Width</strong>: More neurons per layer → more capacity, parallelism.<br />
          <strong>Depth</strong>: More layers → hierarchical feature learning, more expressive.<br />
          Deep + narrow ≠ Wide + shallow in terms of what they learn.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-black rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 380 }}>
        <canvas ref={canvasRef} width={580} height={380} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 2: Representation Learning
// ─────────────────────────────────────────────
function RepresentationLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const [layer, setLayer] = useState(3)
  const [animating, setAnimating] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    // Generate 2D points that form concentric circles (non-linearly separable)
    const points = Array.from({ length: 80 }, (_, i) => {
      const cls = i < 40 ? 0 : 1
      const r = cls === 0 ? 0.2 + Math.random() * 0.2 : 0.6 + Math.random() * 0.2
      const a = Math.random() * 2 * Math.PI
      return { x: r * Math.cos(a), y: r * Math.sin(a), cls }
    })

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.015

      const t = tRef.current
      const layerT = Math.min(layer / 4, 1) // how "transformed" we are

      // Show representation at different layer depths
      const panelW = W / 3

      const labels = ['Raw Input', 'Hidden Layer 2', `Layer ${layer} (Repr.)`]
      const transforms = [0, 0.4, layerT]

      transforms.forEach((transform, pi) => {
        const ox = pi * panelW
        ctx.fillStyle = '#0d1117'; ctx.fillRect(ox + 2, 2, panelW - 4, H - 4)
        ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1; ctx.strokeRect(ox + 2, 2, panelW - 4, H - 4)

        // Panel label
        ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
        ctx.fillText(labels[pi], ox + panelW / 2, 14)

        // Draw decision boundary (becomes linear at high layers)
        if (transform > 0.5) {
          const bY = H / 2
          ctx.beginPath()
          ctx.moveTo(ox + 10, bY + Math.sin(t * 0.5) * 20 * (1 - transform))
          ctx.lineTo(ox + panelW - 10, bY + Math.sin(t * 0.5 + 1) * 20 * (1 - transform))
          ctx.strokeStyle = 'rgba(251,191,36,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.stroke(); ctx.setLineDash([])
        } else if (transform > 0.05) {
          ctx.beginPath()
          ctx.arc(ox + panelW / 2, H / 2, 80 * (1 - transform) + 30 * transform, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(251,191,36,0.4)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([])
        }

        // Points
        points.forEach(({ x, y, cls }, i) => {
          const angle = t * 0.2 + i * 0.05
          // Transform points based on layer depth
          const tx2 = x + transform * (Math.cos(angle) * 0.3 - y * 0.5)
          const ty2 = y + transform * (Math.sin(angle) * 0.3 + x * 0.5)
          const lerpT = Math.min(1, transform * 2)
          const finalX = x * (1 - lerpT) + tx2 * lerpT
          const finalY = y * (1 - lerpT) + ty2 * lerpT

          const cx = ox + panelW / 2 + finalX * (panelW * 0.38)
          const cy = H / 2 + finalY * (H * 0.38)
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2)
          ctx.fillStyle = cls === 0 ? '#3b82f6' : '#ef4444'; ctx.fill()
          ctx.strokeStyle = cls === 0 ? '#60a5fa' : '#fca5a5'; ctx.lineWidth = 1; ctx.stroke()
        })
      })

      // Separability label
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('🔵 Class 0  🔴 Class 1  — Decision Boundary', W / 2, H - 8)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [layer, animating])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Visualization">
          <Slider label="Layer Depth" value={layer} min={1} max={6} onChange={setLayer} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          Deep networks learn to <strong>transform</strong> the input space layer by layer, making complex patterns linearly separable by the final layer.<br /><br />
          Concentric circles (not linearly separable in raw space) become separable in learned representation space.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-black rounded-xl border border-slate-700 overflow-hidden">
        <canvas ref={canvasRef} width={580} height={380} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 3: RBM Visualizer
// ─────────────────────────────────────────────
function RBMLab() {
  const [visibleN, setVisibleN] = useState(6)
  const [hiddenN, setHiddenN] = useState(4)
  const [animating, setAnimating] = useState(false)
  const [phase, setPhase] = useState<'positive' | 'negative' | 'idle'>('idle')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const t = tRef.current
      const phaseT = t % 2 // 0-1: positive phase, 1-2: negative phase
      const isPositive = phaseT < 1
      const progress = isPositive ? phaseT : phaseT - 1

      const visX = 120, hidX = W - 120
      const R = 18
      const visSpacing = Math.min(55, (H - 80) / Math.max(visibleN - 1, 1))
      const hidSpacing = Math.min(55, (H - 80) / Math.max(hiddenN - 1, 1))
      const visStartY = H / 2 - (visibleN - 1) * visSpacing / 2
      const hidStartY = H / 2 - (hiddenN - 1) * hidSpacing / 2

      // Draw bipartite connections
      for (let vi = 0; vi < visibleN; vi++) {
        for (let hi = 0; hi < hiddenN; hi++) {
          const w = Math.sin(vi * 1.1 + hi * 0.8) * 0.5 + 0.5
          const vy = visStartY + vi * visSpacing
          const hy = hidStartY + hi * hidSpacing
          const activeConn = animating && (isPositive ? progress > vi / visibleN : progress > hi / hiddenN)
          ctx.beginPath(); ctx.moveTo(visX + R, vy); ctx.lineTo(hidX - R, hy)
          ctx.strokeStyle = activeConn
            ? (isPositive ? `rgba(59,130,246,${0.3 + w * 0.5})` : `rgba(249,115,22,${0.3 + w * 0.5})`)
            : `rgba(71,85,105,${0.1 + w * 0.15})`
          ctx.lineWidth = activeConn ? 1 + w * 2 : 0.5 + w; ctx.stroke()

          // Signal dot
          if (animating && activeConn) {
            const p = isPositive ? (progress - vi / visibleN) * visibleN : (progress - hi / hiddenN) * hiddenN
            const cp = Math.max(0, Math.min(1, p))
            const dx = visX + R + (hidX - R - visX - R) * (isPositive ? cp : 1 - cp)
            const dy = vy + (hy - vy) * (isPositive ? cp : 1 - cp)
            if (cp > 0 && cp < 1) {
              ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2)
              ctx.fillStyle = isPositive ? '#60a5fa' : '#fb923c'
              ctx.shadowColor = isPositive ? '#3b82f6' : '#f97316'; ctx.shadowBlur = 8
              ctx.fill(); ctx.shadowBlur = 0
            }
          }
        }
      }

      // Visible neurons
      for (let vi = 0; vi < visibleN; vi++) {
        const vy = visStartY + vi * visSpacing
        const actV = Math.max(0, Math.sin(t * 1.5 + vi * 0.6)) * (animating ? 1 : 0.3)
        const isActive = animating && isPositive && progress > vi / visibleN
        ctx.beginPath(); ctx.arc(visX, vy, R, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? '#1e3a5f' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = isActive ? '#3b82f6' : '#334155'; ctx.lineWidth = isActive ? 2.5 : 1.5; ctx.stroke()
        if (isActive) { ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0 }
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`v${vi+1}`, visX, vy + 4)
        ctx.fillText(actV.toFixed(2), visX, vy + R + 12)
      }

      // Hidden neurons
      for (let hi = 0; hi < hiddenN; hi++) {
        const hy = hidStartY + hi * hidSpacing
        const actH = Math.max(0, Math.sin(t * 2 + hi * 0.9)) * (animating ? 1 : 0.3)
        const isActive = animating && (!isPositive ? progress > hi / hiddenN : progress > 0.8)
        ctx.beginPath(); ctx.arc(hidX, hy, R, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? '#1e1040' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = isActive ? '#818cf8' : '#334155'; ctx.lineWidth = isActive ? 2.5 : 1.5; ctx.stroke()
        if (isActive) { ctx.shadowColor = '#818cf8'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0 }
        ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`h${hi+1}`, hidX, hy + 4)
        ctx.fillText(actH.toFixed(2), hidX, hy + R + 12)
      }

      // Labels
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('VISIBLE LAYER', visX, 18)
      ctx.fillText('HIDDEN LAYER', hidX, 18)

      // Phase indicator
      const phaseLabel = !animating ? 'Idle' : isPositive ? '→ Positive Phase (v→h)' : '← Negative Phase (h→v)'
      const phaseColor = !animating ? '#475569' : isPositive ? '#3b82f6' : '#f97316'
      ctx.fillStyle = phaseColor; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(phaseLabel, W / 2, H - 8)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [visibleN, hiddenN, animating])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="RBM Config">
          <Slider label="Visible Units" value={visibleN} min={2} max={12} onChange={setVisibleN} />
          <Slider label="Hidden Units" value={hiddenN} min={2} max={8} onChange={setHiddenN} />
        </ControlSection>
        <InfoBadge label="Connections" value={visibleN * hiddenN} color="violet" />
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? <><Pause size={14} className="inline mr-1" />Pause</> : <><Play size={14} className="inline mr-1" />Animate CD</>}
        </Button>
        <ExplanationBox>
          <strong>Restricted Boltzmann Machine:</strong><br />
          Bipartite graph — visible (input) and hidden (feature) layers.<br />
          Trained via Contrastive Divergence (CD):<br />
          1. <strong>Positive phase</strong>: clamp visible, sample hidden<br />
          2. <strong>Negative phase</strong>: reconstruct visible from hidden<br />
          No connections within same layer!
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-black rounded-xl border border-slate-700 overflow-hidden">
        <canvas ref={canvasRef} width={560} height={360} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 4: Basic Autoencoder
// ─────────────────────────────────────────────
function AutoencoderLab() {
  const [latentDim, setLatentDim] = useState(2)
  const [animating, setAnimating] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [history, setHistory] = useState<{epoch:number;loss:number}[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const trainRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const t = tRef.current
      const phase = t % 3 // 0-1: encode, 1-2: latent, 2-3: decode

      // Layout: Input → Encoder → Latent → Decoder → Output
      const sections = [
        { label: 'Input\n(8)', n: 8, x: 60, color: '#1e3a5f', border: '#3b82f6' },
        { label: 'Enc H1\n(5)', n: 5, x: 155, color: '#1e293b', border: '#818cf8' },
        { label: 'Enc H2\n(3)', n: 3, x: 240, color: '#1e293b', border: '#a78bfa' },
        { label: `Latent\n(${latentDim})`, n: latentDim, x: 320, color: '#1a1060', border: '#7c3aed' },
        { label: 'Dec H1\n(3)', n: 3, x: 400, color: '#1e293b', border: '#f97316' },
        { label: 'Dec H2\n(5)', n: 5, x: 485, color: '#1e293b', border: '#fb923c' },
        { label: 'Output\n(8)', n: 8, x: 575, color: '#0f2214', border: '#10b981' },
      ]
      const R = 12
      const secSpacing = 38

      sections.forEach((sec, si) => {
        const startY = H / 2 - (sec.n - 1) * secSpacing / 2
        const isActive = animating && (
          (phase < 1 && si <= phase * sections.length * 0.5) ||
          (phase >= 1 && phase < 2 && si === 3) ||
          (phase >= 2 && si >= 3 + (phase - 2) * sections.length * 0.5)
        )

        // Connections
        if (si < sections.length - 1) {
          const next = sections[si + 1]
          const nextStartY = H / 2 - (next.n - 1) * secSpacing / 2
          for (let ni = 0; ni < sec.n; ni++) {
            for (let nj = 0; nj < next.n; nj++) {
              ctx.beginPath()
              ctx.moveTo(sec.x, startY + ni * secSpacing)
              ctx.lineTo(next.x, nextStartY + nj * secSpacing)
              ctx.strokeStyle = isActive ? `rgba(${si < 3 ? '129,140,248' : '249,115,22'},0.25)` : 'rgba(71,85,105,0.1)'
              ctx.lineWidth = isActive ? 1 : 0.5; ctx.stroke()
            }
          }
        }

        // Neurons
        for (let ni = 0; ni < sec.n; ni++) {
          const ny = startY + ni * secSpacing
          const actV = isActive ? Math.max(0, Math.sin(t * 2 + ni * 0.7 + si)) : 0
          ctx.beginPath(); ctx.arc(sec.x, ny, R, 0, Math.PI * 2)
          ctx.fillStyle = isActive ? sec.color.replace('1e', '2a').replace('0f', '1a') : sec.color; ctx.fill()
          ctx.strokeStyle = isActive ? sec.border : '#334155'; ctx.lineWidth = isActive ? 2 : 1.2; ctx.stroke()
          if (isActive) { ctx.shadowColor = sec.border; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0 }
          if (R > 8 && sec.n <= 4) {
            ctx.fillStyle = '#94a3b8'; ctx.font = '7px monospace'; ctx.textAlign = 'center'
            ctx.fillText(actV.toFixed(1), sec.x, ny + 3)
          }
        }

        // Label
        sec.label.split('\n').forEach((l, li) => {
          ctx.fillStyle = isActive ? '#e2e8f0' : '#64748b'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(l, sec.x, H - 22 + li * 10)
        })
      })

      // Bottleneck arrow
      ctx.fillStyle = '#7c3aed'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('↑ compress', 320, H / 2 - (latentDim - 1) * secSpacing / 2 - R - 8)

      // Phase indicator
      const phaseLabels = ['Encoding...', 'In Latent Space', 'Decoding...']
      ctx.fillStyle = phase < 1 ? '#818cf8' : phase < 2 ? '#7c3aed' : '#f97316'
      ctx.fillText(animating ? phaseLabels[Math.min(2, Math.floor(phase))] : 'Paused', W / 2, H - 4)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [latentDim, animating])

  useEffect(() => {
    if (!animating) { trainRef.current = false; return }
    trainRef.current = true
    let ep = epoch
    function step() {
      if (!trainRef.current) return
      ep++
      const baseLoss = 2 * Math.exp(-ep * 0.03)
      setEpoch(ep); setHistory(h => [...h, { epoch: ep, loss: +(baseLoss + (Math.random()-0.5)*0.15).toFixed(4) }].slice(-120))
      if (ep < 200) setTimeout(step, 120)
    }
    setTimeout(step, 100)
    return () => { trainRef.current = false }
  }, [animating])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Autoencoder Config">
          <Slider label="Latent Dimension" value={latentDim} min={1} max={6} onChange={v => { setLatentDim(v); setHistory([]); setEpoch(0) }} />
        </ControlSection>
        <InfoBadge label="Epoch" value={epoch} color="violet" />
        <InfoBadge label="Recon. Loss" value={history.length ? history[history.length-1].loss.toFixed(4) : '—'} color="orange" />
        <Button onClick={() => { setAnimating(a => !a); if (animating) { setEpoch(0); setHistory([]) } }}
          variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? 'Stop' : 'Train'}
        </Button>
        <ExplanationBox>
          <strong>Autoencoder:</strong> Encoder compresses input to latent space z, decoder reconstructs x̂ from z.<br />
          Loss = ||x − x̂||² (MSE).<br />
          Smaller latent dim = stronger compression = harder reconstruction.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-black rounded-xl border border-slate-700 overflow-hidden" style={{ height: 400 }}>
          <canvas ref={canvasRef} width={600} height={400} className="w-full h-full" />
        </div>
        <LossChart data={history} title="Reconstruction Loss" height={130} />
      </div>
    </div>
  )
}
