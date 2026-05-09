import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Slider, Select, ControlSection, Button, InfoBadge, ExplanationBox } from '../components/ControlPanel'
import GenerativeCanvas from '../labs/GenerativeCanvas'
import LossChart from '../labs/LossChart'
import { Play, Pause, RotateCcw } from 'lucide-react'

type Lab5 = 'autoencoder' | 'gan' | 'boltzmann' | 'dbn' | 'dbm'

const LABS: { id: Lab5; label: string }[] = [
  { id: 'autoencoder', label: 'Autoencoder' },
  { id: 'gan', label: 'GAN Trainer' },
  { id: 'boltzmann', label: 'Boltzmann Machine' },
  { id: 'dbn', label: 'Deep Belief Network' },
  { id: 'dbm', label: 'Deep Boltzmann Machine' },
]

export default function Unit5Page() {
  const [activeLab, setActiveLab] = useState<Lab5>('autoencoder')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const labParam = searchParams.get('lab')
    if (labParam) {
      const labMap: Record<string, Lab5> = {
        'autoencoder': 'autoencoder',
        'gan-trainer': 'gan',
        'boltzmann-machine': 'boltzmann',
        'deep-belief-network': 'dbn',
        'deep-boltzmann-machine': 'dbm',
      }
      const mappedLab = labMap[labParam] as Lab5
      if (mappedLab) setActiveLab(mappedLab)
    }
  }, [searchParams])

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto animate-fadeInUp bg-slate-50">
      <div className="mb-4">
        <h1 className="text-base sm:text-lg md:text-2xl font-bold text-slate-800">Chapter V – Generative & Unsupervised Models</h1>
        <p className="text-sm text-slate-500">Autoencoder · GAN · Boltzmann Machine · DBN · DBM</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-1.5" style={{ display: 'none' }}>
        {LABS.map(lab => (
          <button key={lab.id} onClick={() => setActiveLab(lab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeLab === lab.id ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {lab.label}
          </button>
        ))}
      </div>
      {activeLab === 'autoencoder' && <AutoencoderLab />}
      {activeLab === 'gan' && <GANLab />}
      {activeLab === 'boltzmann' && <BoltzmannLab />}
      {activeLab === 'dbn' && <DBNLab />}
      {activeLab === 'dbm' && <DBMLab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 1: Autoencoder with Latent Space
// ─────────────────────────────────────────────
function AutoencoderLab() {
  const [animating, setAnimating] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [latentDim, setLatentDim] = useState(3)
  const [history, setHistory] = useState<{ epoch: number; loss: number }[]>([])
  const trainRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  // Latent space scatter plot
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.015

      const t = tRef.current
      // Show latent space as 2D scatter
      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Latent Space Visualization', W / 2, 16)

      const nPoints = 120
      const nClusters = 4
      const clusterColors = ['#3b82f6', '#10b981', '#f97316', '#a78bfa']
      const clusterCenters = [
        { x: 0.25, y: 0.3 }, { x: 0.75, y: 0.3 }, { x: 0.25, y: 0.7 }, { x: 0.75, y: 0.7 }
      ]

      // Animate cluster tightening over epoch
      const tightness = Math.min(epoch / 50, 1) * 0.8

      for (let i = 0; i < nPoints; i++) {
        const cluster = i % nClusters
        const center = clusterCenters[cluster]
        const spread = 0.2 * (1 - tightness) + 0.04 * tightness
        const px = center.x + (Math.sin(i * 2.3 + cluster) * spread)
        const py = center.y + (Math.cos(i * 1.7 + cluster * 0.8) * spread)
        const cx = 20 + px * (W - 40)
        const cy = 24 + py * (H - 44)

        ctx.beginPath()
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = clusterColors[cluster] + (animating ? 'cc' : '88')
        ctx.fill()
        if (animating) {
          ctx.strokeStyle = clusterColors[cluster]; ctx.lineWidth = 0.8; ctx.stroke()
        }
      }

      // Axes
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(20, H - 20); ctx.lineTo(W - 10, H - 20); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(20, H - 20); ctx.lineTo(20, 20); ctx.stroke()
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('z₁', W / 2, H - 6)
      ctx.save(); ctx.translate(10, H / 2); ctx.rotate(-Math.PI / 2)
      ctx.fillText('z₂', 0, 0); ctx.restore()

      // Legend
      clusterColors.forEach((c, i) => {
        ctx.beginPath(); ctx.arc(32 + i * 50, H - 10, 4, 0, Math.PI * 2)
        ctx.fillStyle = c; ctx.fill()
        ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'left'
        ctx.fillText(`C${i+1}`, 40 + i * 50, H - 6)
      })
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [animating, epoch])

  useEffect(() => {
    if (!animating) { trainRef.current = false; return }
    trainRef.current = true
    let ep = epoch

    function step() {
      if (!trainRef.current) return
      ep++
      const loss = 1.5 * Math.exp(-ep * 0.025) + (Math.random() - 0.5) * 0.1
      setEpoch(ep)
      setHistory(h => [...h, { epoch: ep, loss: +loss.toFixed(4) }].slice(-150))
      if (ep < 200) setTimeout(step, 80)
      else { trainRef.current = false; setAnimating(false) }
    }
    setTimeout(step, 80)
    return () => { trainRef.current = false }
  }, [animating])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="Config">
          <Slider label="Latent Dimensions" value={latentDim} min={1} max={8}
            onChange={v => { setLatentDim(v); setEpoch(0); setHistory([]) }} />
        </ControlSection>
        <InfoBadge label="Epoch" value={epoch} color="rose" />
        <InfoBadge label="Recon. Loss" value={history.length ? history[history.length-1].loss.toFixed(4) : '—'} color="orange" />
        <div className="flex gap-2 mt-2 mb-3">
          <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="flex-1">
            {animating ? 'Stop' : 'Train'}
          </Button>
          <Button onClick={() => { trainRef.current = false; setAnimating(false); setEpoch(0); setHistory([]) }} variant="secondary">
            <RotateCcw size={14} />
          </Button>
        </div>
        <ExplanationBox>
          <strong>Autoencoder:</strong><br />
          Encoder: x → z (compress to latent space)<br />
          Decoder: z → x̂ (reconstruct input)<br /><br />
          The latent space clusters similar inputs together. As training progresses, clusters become more distinct.
        </ExplanationBox>
      </div>
      <div className="md:col-span-2 space-y-3">
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3 h-60">
          <p className="text-xs text-slate-400 font-medium mb-2">Autoencoder – Input → Encoder → Latent → Decoder → Output</p>
          <GenerativeCanvas mode="autoencoder" animating={animating} epoch={epoch} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <canvas ref={canvasRef} width={280} height={240} className="w-full h-full" />
          </div>
          <LossChart data={history} title="Reconstruction Loss" height={240} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 2: GAN Trainer
// ─────────────────────────────────────────────
function GANLab() {
  const [animating, setAnimating] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [lr, setLr] = useState(0.0002)
  const [history, setHistory] = useState<{ epoch: number; loss: number; valLoss?: number }[]>([])
  const trainRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const [gLoss, setGLoss] = useState(0)
  const [dLoss, setDLoss] = useState(0)

  // Generated samples visualizer
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const t = tRef.current
      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Generated Samples (getting more realistic)', W / 2, 14)

      const quality = Math.min(epoch / 80, 1)
      const cols = 6, rows = 4
      const cellW = (W - 20) / cols
      const cellH = (H - 30) / rows

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = 10 + c * cellW
          const oy = 24 + r * cellH
          const imgData = ctx.createImageData(Math.floor(cellW - 4), Math.floor(cellH - 4))

          for (let py = 0; py < cellH - 4; py++) {
            for (let px = 0; px < cellW - 4; px++) {
              const idx = (py * Math.floor(cellW - 4) + px) * 4
              const noise = Math.random()
              const pattern = Math.sin((px / (cellW - 4)) * Math.PI * 3 + t * 0.3 + r) *
                              Math.cos((py / (cellH - 4)) * Math.PI * 2 + c * 0.5) * 0.5 + 0.5
              const v = noise * (1 - quality) + pattern * quality
              const gv = Math.round(v * 200 + 28)
              imgData.data[idx] = gv; imgData.data[idx+1] = gv; imgData.data[idx+2] = gv + 20; imgData.data[idx+3] = 255
            }
          }

          const tmpC = document.createElement('canvas')
          tmpC.width = Math.floor(cellW - 4); tmpC.height = Math.floor(cellH - 4)
          tmpC.getContext('2d')!.putImageData(imgData, 0, 0)
          ctx.drawImage(tmpC, ox, oy)

          ctx.strokeStyle = quality > 0.5 ? '#10b98155' : '#ef444455'
          ctx.lineWidth = 1; ctx.strokeRect(ox, oy, cellW - 4, cellH - 4)
        }
      }
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [animating, epoch])

  useEffect(() => {
    if (!animating) { trainRef.current = false; return }
    trainRef.current = true
    let ep = epoch

    function step() {
      if (!trainRef.current) return
      ep++
      // Realistic GAN loss behavior
      const gL = 2.0 * Math.exp(-ep * 0.015) + 0.5 + (Math.random() - 0.5) * 0.4
      const dL = 0.3 + 0.4 * Math.exp(-ep * 0.02) + (Math.random() - 0.5) * 0.2
      setEpoch(ep); setGLoss(gL); setDLoss(dL)
      setHistory(h => [...h, { epoch: ep, loss: +gL.toFixed(4), valLoss: +dL.toFixed(4) }].slice(-150))
      if (ep < 200) setTimeout(step, 100)
      else { trainRef.current = false; setAnimating(false) }
    }
    setTimeout(step, 100)
    return () => { trainRef.current = false }
  }, [animating])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="GAN Config">
          <Slider label="Learning Rate" value={lr} min={0.00005} max={0.001} step={0.00005} onChange={setLr} />
        </ControlSection>
        <InfoBadge label="Epoch" value={epoch} color="rose" />
        <InfoBadge label="G Loss" value={gLoss.toFixed(4)} color="violet" />
        <InfoBadge label="D Loss" value={dLoss.toFixed(4)} color="orange" />
        <div className="flex gap-2 mt-2 mb-3">
          <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="flex-1">
            {animating ? 'Stop' : 'Train GAN'}
          </Button>
          <Button onClick={() => { trainRef.current = false; setAnimating(false); setEpoch(0); setHistory([]) }} variant="secondary">
            <RotateCcw size={14} />
          </Button>
        </div>
        <ExplanationBox>
          <strong>GAN (Goodfellow 2014):</strong><br /><br />
          <strong>Generator G:</strong> Noise z → Fake data<br />
          <strong>Discriminator D:</strong> Real or Fake?<br /><br />
          Min-max game:<br />
          <code>min_G max_D V(D,G)</code><br /><br />
          D Loss = -log(D(x)) - log(1-D(G(z)))<br />
          G Loss = -log(D(G(z)))
        </ExplanationBox>
      </div>
      <div className="md:col-span-2 space-y-3">
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3 h-60">
          <p className="text-xs text-slate-400 font-medium mb-2">GAN Training – Generator vs Discriminator</p>
          <GenerativeCanvas mode="gan" animating={animating} epoch={epoch} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            <canvas ref={canvasRef} width={280} height={240} className="w-full h-full" />
          </div>
          <LossChart data={history} title="G Loss vs D Loss" height={240} />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 3: Boltzmann Machine (RBM)
// ─────────────────────────────────────────────
function BoltzmannLab() {
  const [animating, setAnimating] = useState(false)
  const [temp, setTemp] = useState(1.0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    // Energy landscape + Boltzmann distribution
    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const t = tRef.current
      const halfW = W / 2

      // Left: Energy landscape
      const energyW = halfW - 10
      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Energy Landscape', energyW / 2, 14)

      ctx.beginPath()
      for (let px = 0; px < energyW; px++) {
        const x = (px / energyW) * 4 - 2
        const energy = Math.sin(x * 2) * 0.5 + Math.cos(x * 3) * 0.3 + x * x * 0.1
        const cy = H - 20 - (energy + 1.5) / 3.5 * (H - 50)
        if (px === 0) ctx.moveTo(px + 10, cy); else ctx.lineTo(px + 10, cy)
      }
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2.5; ctx.stroke()

      // Particle sampling from distribution
      const nParticles = 30
      for (let i = 0; i < nParticles; i++) {
        const x = (Math.sin(t * 0.5 + i * 2.1) * temp + (i / nParticles) * 4 - 2)
        const energy = Math.sin(x * 2) * 0.5 + Math.cos(x * 3) * 0.3 + x * x * 0.1
        const prob = Math.exp(-energy / temp)
        const py = H - 20 - (energy + 1.5) / 3.5 * (H - 50) - 10
        const px = ((x + 2) / 4) * energyW + 10
        if (px > 10 && px < energyW + 10 && py > 20) {
          ctx.beginPath(); ctx.arc(px, py - Math.abs(Math.sin(t + i)) * 20 * temp, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(96,165,250,${Math.min(1, prob)})`
          ctx.fill()
        }
      }

      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`T = ${temp.toFixed(2)}`, energyW / 2, H - 6)
      ctx.fillText('state', energyW / 2, H - 18)

      // Divider
      ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(halfW, 20); ctx.lineTo(halfW, H - 10); ctx.stroke()

      // Right: Boltzmann distribution P(state) ∝ e^(-E/T)
      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Boltzmann Distribution', halfW + (W - halfW) / 2, 14)

      const barW = 24, barGap = 8
      const nStates = Math.floor((W - halfW - 20) / (barW + barGap))
      const energies = Array.from({ length: nStates }, (_, i) =>
        Math.sin(i * 1.3 + 0.5) * 2 + Math.cos(i * 0.8) * 1.5
      )
      const probs = energies.map(e => Math.exp(-e / temp))
      const sumProbs = probs.reduce((a, b) => a + b, 0)
      const normProbs = probs.map(p => p / sumProbs)

      normProbs.forEach((p, i) => {
        const bx = halfW + 10 + i * (barW + barGap)
        const bh = p * (H - 60)
        const by = H - 20 - bh
        const isHigh = p > 0.15
        ctx.fillStyle = isHigh ? '#2563eb' : '#1e3a5f'
        ctx.fillRect(bx, by, barW, bh)
        ctx.strokeStyle = isHigh ? '#3b82f6' : '#334155'; ctx.lineWidth = 1
        ctx.strokeRect(bx, by, barW, bh)
        ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`s${i+1}`, bx + barW / 2, H - 6)
        if (p > 0.08) {
          ctx.fillStyle = '#94a3b8'
          ctx.fillText(p.toFixed(2), bx + barW / 2, by - 3)
        }
      })
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [animating, temp])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="BM Config">
          <Slider label="Temperature (T)" value={temp} min={0.1} max={5} step={0.1} onChange={setTemp} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Boltzmann Machine:</strong><br /><br />
          P(state) ∝ e^(−E(state)/T)<br /><br />
          <strong>Low T:</strong> Samples concentrate near low-energy states (sharp distribution).<br /><br />
          <strong>High T:</strong> Uniform sampling – high entropy.<br /><br />
          Training: Minimize difference between data and model distributions.
        </ExplanationBox>
        <div className="mt-3">
          <div className="bg-slate-900 rounded-xl overflow-hidden h-60">
            <GenerativeCanvas mode="boltzmann" animating={animating} />
          </div>
        </div>
      </div>
      <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 240 }}>
        <canvas ref={canvasRef} width={580} height={240} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 4: Deep Belief Network
// ─────────────────────────────────────────────
function DBNLab() {
  const [animating, setAnimating] = useState(false)
  const [numLayers, setNumLayers] = useState(3)
  const [greedyLayer, setGreedyLayer] = useState(1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="DBN Config">
          <Slider label="Number of RBM Layers" value={numLayers} min={2} max={4} onChange={setNumLayers} />
          <Slider label="Greedy Pre-train Layer" value={greedyLayer} min={1} max={numLayers}
            onChange={v => setGreedyLayer(Math.min(v, numLayers))} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Deep Belief Network (DBN):</strong><br /><br />
          Stack of RBMs trained greedily layer by layer.<br /><br />
          <strong>Pre-training:</strong><br />
          1. Train RBM₁ on raw data<br />
          2. Use h₁ as input, train RBM₂<br />
          3. Continue for each layer<br /><br />
          <strong>Fine-tuning:</strong> Wake-sleep algorithm on full network.
        </ExplanationBox>
      </div>
      <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3 h-60">
        <p className="text-xs text-slate-400 font-medium mb-2">DBN – Greedy Layer-wise Pre-training</p>
        <GenerativeCanvas mode="dbn" animating={animating} epoch={greedyLayer} />
        <div className="mt-2 flex gap-2">
          {Array.from({ length: numLayers }, (_, i) => (
            <button key={i}
              onClick={() => setGreedyLayer(i + 1)}
              className={`flex-1 text-xs py-1 rounded-lg transition-colors ${greedyLayer === i + 1 ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              RBM Layer {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 5: Deep Boltzmann Machine
// ─────────────────────────────────────────────
function DBMLab() {
  const [animating, setAnimating] = useState(false)
  const [numLayers, setNumLayers] = useState(3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="DBM Config">
          <Slider label="Hidden Layers" value={numLayers} min={2} max={4} onChange={setNumLayers} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Deep Boltzmann Machine (DBM):</strong><br /><br />
          Fully undirected graphical model with multiple hidden layers.<br /><br />
          Unlike DBN: <strong>all connections are bidirectional (⇅)</strong><br /><br />
          Inference via mean-field variational inference.<br /><br />
          Training: Contrastive Divergence or Persistent CD.
        </ExplanationBox>
        <div className="mt-3 space-y-1.5 text-xs text-slate-500">
          <p><strong className="text-slate-700">DBN vs DBM:</strong></p>
          <p>• DBN: top two layers undirected, lower layers directed (generative)</p>
          <p>• DBM: all layers undirected (symmetric connections)</p>
          <p>• DBM better at multi-modal distributions</p>
        </div>
      </div>
      <div className="md:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3 h-60">
        <p className="text-xs text-slate-400 font-medium mb-2">DBM – Bidirectional Connections All Layers</p>
        <GenerativeCanvas mode="dbm" animating={animating} epoch={numLayers} />
        <div className="mt-3 bg-slate-800 rounded-lg p-3 text-xs text-slate-400">
          <strong className="text-slate-300">Mean-Field Variational Inference:</strong><br />
          μᵢ ← σ(∑ⱼ Wᵢⱼμⱼ) iterating until convergence.<br />
          Bidirectional arrows (⇅) indicate symmetric weight matrices Wᵢⱼ = Wⱼᵢᵀ.
        </div>
      </div>
    </div>
  )
}
