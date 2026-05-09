import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Slider, Select, ControlSection, Button, InfoBadge, ExplanationBox } from '../components/ControlPanel'
import CNNCanvas from '../labs/CNNCanvas'
import { Play, Pause, RotateCcw } from 'lucide-react'

type CNNModel = 'alexnet' | 'resnet' | 'densenet' | 'pixelnet'
type Lab3 = 'cnn_arch' | 'filter_slide' | 'feature_map' | 'param_share'

const LABS: { id: Lab3; label: string }[] = [
  { id: 'cnn_arch', label: 'CNN Architecture' },
  { id: 'filter_slide', label: 'Filter Sliding' },
  { id: 'feature_map', label: 'Feature Maps' },
  { id: 'param_share', label: 'Parameter Sharing' },
]

export default function Unit3Page() {
  const [activeLab, setActiveLab] = useState<Lab3>('cnn_arch')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const labParam = searchParams.get('lab')
    if (labParam) {
      const labMap: Record<string, Lab3> = {
        'cnn-architecture': 'cnn_arch',
        'filter-sliding': 'filter_slide',
        'feature-maps': 'feature_map',
        'parameter-sharing': 'param_share',
      }
      const mappedLab = labMap[labParam] as Lab3
      if (mappedLab) setActiveLab(mappedLab)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 sm:mb-4 md:mb-6">
          <h1 className="text-base sm:text-lg md:text-2xl font-bold text-slate-800">Chapter III – Convolutional Neural Networks</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">CNN Architectures, Filters, Feature Maps, AlexNet · ResNet · DenseNet · PixelNet</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-1.5" style={{ display: 'none' }}>
        {LABS.map(lab => (
          <button key={lab.id} onClick={() => setActiveLab(lab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeLab === lab.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {lab.label}
          </button>
        ))}
      </div>
      {activeLab === 'cnn_arch' && <CNNArchLab />}
      {activeLab === 'filter_slide' && <FilterSlideLab />}
      {activeLab === 'feature_map' && <FeatureMapLab />}
      {activeLab === 'param_share' && <ParamShareLab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 1: CNN Architecture Selector
// ─────────────────────────────────────────────
function CNNArchLab() {
  const [model, setModel] = useState<CNNModel>('alexnet')
  const [animating, setAnimating] = useState(false)

  const modelInfo: Record<CNNModel, { year: string; params: string; desc: string; innovation: string }> = {
    alexnet: { year: '2012', params: '60M', desc: 'First deep CNN to win ImageNet (top-5 error: 15.3%). Used ReLU, dropout, and GPU training.', innovation: 'ReLU activation, Dropout regularization, GPU training' },
    resnet: { year: '2015', params: '25M', desc: 'Introduced skip connections (residual learning) to train very deep networks (up to 152 layers).', innovation: 'Skip connections, Batch normalization, 152 layers' },
    densenet: { year: '2017', params: '8M', desc: 'Each layer connects to all subsequent layers (dense connections). Better gradient flow and feature reuse.', innovation: 'Dense connections, feature reuse, fewer params' },
    pixelnet: { year: '2017', params: '~10M', desc: 'Hypercolumn-based pixel-level prediction. Samples from all layers for per-pixel classification.', innovation: 'Hypercolumns, pixel-level prediction, multi-scale' },
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="Select Model">
          {(['alexnet','resnet','densenet','pixelnet'] as CNNModel[]).map(m => (
            <button key={m} onClick={() => setModel(m)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm mb-1.5 transition-colors font-medium ${model === m ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
              <span className={`text-xs ml-2 ${model === m ? 'text-emerald-200' : 'text-slate-400'}`}>{modelInfo[m].year}</span>
            </button>
          ))}
        </ControlSection>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Parameters</span>
            <span className="font-mono text-slate-700">{modelInfo[model].params}</span>
          </div>
          <div className="text-xs font-semibold text-emerald-600 mb-1">Key Innovation:</div>
          <div className="text-xs text-slate-500">{modelInfo[model].innovation}</div>
        </div>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3 text-sm">
          {animating ? <><Pause size={14} className="inline mr-1"/>Pause</> : <><Play size={14} className="inline mr-1"/>Animate</>}
        </Button>
        <ExplanationBox>{modelInfo[model].desc}</ExplanationBox>
      </div>
      <div className="md:col-span-2 space-y-3">
        <div className="bg-slate-900 rounded-lg sm:rounded-xl border border-slate-700 p-3 overflow-hidden" style={{ minHeight: 240 }}>
          <p className="text-xs text-slate-400 font-medium mb-2">{model.toUpperCase()} – Architecture Blocks</p>
          <CNNCanvas model={model} animating={animating} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Architecture Notes</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {model === 'alexnet' && <>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Conv Layers</span><span className="text-slate-500">5 conv layers with ReLU</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Pooling</span><span className="text-slate-500">3 max pooling layers</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">FC Layers</span><span className="text-slate-500">3 fully connected</span></div>
            </>}
            {model === 'resnet' && <>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Skip Conn.</span><span className="text-slate-500">F(x) + x identity</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">BatchNorm</span><span className="text-slate-500">After every conv</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">No Dropout</span><span className="text-slate-500">Uses BN instead</span></div>
            </>}
            {model === 'densenet' && <>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Dense Block</span><span className="text-slate-500">All prev features concat</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Growth Rate k</span><span className="text-slate-500">32 filters per layer</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Transition</span><span className="text-slate-500">BN→Conv→AvgPool ÷2</span></div>
            </>}
            {model === 'pixelnet' && <>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Hypercolumn</span><span className="text-slate-500">Sample all layer feats</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Per-pixel MLP</span><span className="text-slate-500">2048→1024→K classes</span></div>
              <div className="bg-slate-50 rounded-lg p-2"><span className="font-medium text-slate-700 block">Multi-scale</span><span className="text-slate-500">Low-high feature fusion</span></div>
            </>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 2: Filter Sliding Animation
// ─────────────────────────────────────────────
function FilterSlideLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const [filterSize, setFilterSize] = useState(3)
  const [stride, setStride] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [padding, setPadding] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const inputSize = 7
    const cellSize = 36

    // Random input image
    const inputImg = Array.from({ length: inputSize }, (_, i) =>
      Array.from({ length: inputSize }, (_, j) => Math.round(Math.random() * 200 + 28))
    )

    // Random filter
    const filter = Array.from({ length: filterSize }, () =>
      Array.from({ length: filterSize }, () => (Math.random() * 2 - 1).toFixed(2))
    )

    // Output size
    const outSize = Math.floor((inputSize + 2 * padding - filterSize) / stride) + 1
    const outputMap = Array.from({ length: outSize }, () => Array(outSize).fill(0))

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.03

      const totalPos = outSize * outSize
      const currPos = animating ? Math.floor(tRef.current * totalPos * 0.5) % (totalPos + 1) : 0
      const currRow = Math.floor(currPos / outSize)
      const currCol = currPos % outSize

      const inputX = 40, inputY = 60
      const filterX = inputX + (inputSize + 3) * cellSize + 30
      const filterY = inputY + (inputSize - filterSize) * cellSize / 2
      const outputX = filterX + (filterSize + 3) * cellSize + 30
      const outputY = inputY + (inputSize - outSize) * cellSize / 2

      // Draw input grid
      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillStyle = '#64748b'; ctx.fillText(`Input (${inputSize}×${inputSize})`, inputX + (inputSize * cellSize) / 2, inputY - 10)
      for (let r = 0; r < inputSize; r++) {
        for (let c = 0; c < inputSize; c++) {
          const fx = inputX + c * cellSize
          const fy = inputY + r * cellSize
          const val = inputImg[r][c]
          const isInFilter = animating && r >= currRow * stride && r < currRow * stride + filterSize &&
                             c >= currCol * stride && c < currCol * stride + filterSize
          ctx.fillStyle = isInFilter ? `rgba(59,130,246,0.3)` : `rgb(${val/5+20},${val/5+25},${val/5+40})`
          ctx.fillRect(fx, fy, cellSize - 2, cellSize - 2)
          if (isInFilter) {
            ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2
            ctx.strokeRect(fx, fy, cellSize - 2, cellSize - 2)
          }
          ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(String(val), fx + cellSize / 2 - 1, fy + cellSize / 2 + 3)
        }
      }

      // Sliding filter highlight on input
      if (animating && currPos < totalPos) {
        const hx = inputX + currCol * stride * cellSize
        const hy = inputY + currRow * stride * cellSize
        ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3
        ctx.strokeRect(hx, hy, filterSize * cellSize - 2, filterSize * cellSize - 2)
        ctx.fillStyle = 'rgba(249,115,22,0.08)'
        ctx.fillRect(hx, hy, filterSize * cellSize - 2, filterSize * cellSize - 2)
      }

      // Arrow
      ctx.beginPath()
      ctx.moveTo(inputX + inputSize * cellSize + 4, H / 2)
      ctx.lineTo(filterX - 6, H / 2)
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke()

      // Draw filter
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Filter (${filterSize}×${filterSize})`, filterX + (filterSize * cellSize) / 2, filterY - 10)
      for (let r = 0; r < filterSize; r++) {
        for (let c = 0; c < filterSize; c++) {
          const fx = filterX + c * cellSize
          const fy = filterY + r * cellSize
          const val = parseFloat(filter[r][c])
          const intensity = Math.min(1, Math.abs(val))
          ctx.fillStyle = val >= 0 ? `rgba(59,130,246,${0.2 + intensity * 0.5})` : `rgba(239,68,68,${0.2 + intensity * 0.5})`
          ctx.fillRect(fx, fy, cellSize - 2, cellSize - 2)
          ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(fx, fy, cellSize - 2, cellSize - 2)
          ctx.fillStyle = '#e2e8f0'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(filter[r][c], fx + cellSize / 2 - 1, fy + cellSize / 2 + 3)
        }
      }

      // Arrow
      ctx.beginPath()
      ctx.moveTo(filterX + filterSize * cellSize + 4, H / 2)
      ctx.lineTo(outputX - 6, H / 2)
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#10b981'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
      ctx.fillText('*', filterX + filterSize * cellSize + 14, H / 2 + 4)

      // Draw output feature map
      ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`Feature Map (${outSize}×${outSize})`, outputX + (outSize * cellSize) / 2, outputY - 10)
      for (let r = 0; r < outSize; r++) {
        for (let c = 0; c < outSize; c++) {
          const fx = outputX + c * cellSize
          const fy = outputY + r * cellSize
          const computed = currPos > r * outSize + c && animating
          const isActive = animating && r === currRow && c === currCol
          const val = computed ? (Math.random() * 2 - 1) : 0
          ctx.fillStyle = isActive ? 'rgba(16,185,129,0.5)' : computed ? `rgba(16,185,129,${0.1 + Math.abs(val) * 0.2})` : '#1e293b'
          ctx.fillRect(fx, fy, cellSize - 2, cellSize - 2)
          if (isActive) { ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.5; ctx.strokeRect(fx, fy, cellSize - 2, cellSize - 2) }
          else { ctx.strokeStyle = '#334155'; ctx.lineWidth = 1; ctx.strokeRect(fx, fy, cellSize - 2, cellSize - 2) }
          if (computed) {
            ctx.fillStyle = '#94a3b8'; ctx.font = '8px monospace'; ctx.textAlign = 'center'
            ctx.fillText(val.toFixed(1), fx + cellSize / 2 - 1, fy + cellSize / 2 + 3)
          }
        }
      }

      // Stats
      ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'left'
      ctx.fillText(`Stride: ${stride}  Padding: ${padding}  Output: ${outSize}×${outSize}`, 10, H - 8)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [filterSize, stride, padding, animating])

  return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="Convolution Config">
          <Select label="Filter Size" value={String(filterSize)}
            options={[{value:'2',label:'2×2'},{value:'3',label:'3×3'},{value:'5',label:'5×5'}]}
            onChange={v => setFilterSize(Number(v))} />
          <Slider label="Stride" value={stride} min={1} max={3} onChange={setStride} />
          <Slider label="Padding" value={padding} min={0} max={2} onChange={setPadding} />
        </ControlSection>
        <InfoBadge label="Output Size" value={`${Math.floor((7 + 2*padding - filterSize)/stride + 1)}×${Math.floor((7 + 2*padding - filterSize)/stride + 1)}`} color="emerald" />
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2">
          {animating ? 'Pause' : 'Animate Filter'}
        </Button>
        <div className="mt-3">
          <ExplanationBox>
            <strong>Convolution:</strong> The filter (kernel) slides across the input, performing element-wise multiplication and summation at each position.<br /><br />
            <code>out_size = ⌊(in + 2p − f) / s⌋ + 1</code><br />
            where p=padding, f=filter, s=stride.
          </ExplanationBox>
        </div>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 360 }}>
        <canvas ref={canvasRef} width={600} height={360} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 3: Feature Map Visualization
// ─────────────────────────────────────────────
function FeatureMapLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [numFilters, setNumFilters] = useState(8)
  const [filterType, setFilterType] = useState('edge')
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    // Generate sample feature maps based on filter type
    function getFilterResponse(filterIdx: number, x: number, y: number, t: number): number {
      const freq = (filterIdx + 1) * 0.3
      switch (filterType) {
        case 'edge': return Math.abs(Math.sin(x * freq + t * 0.1)) * Math.abs(Math.cos(y * freq))
        case 'texture': return Math.sin(x * freq + t * 0.05) * Math.cos(y * freq * 1.3) * 0.5 + 0.5
        case 'color': return Math.sin((x + y) * freq * 0.5 + filterIdx + t * 0.08) * 0.5 + 0.5
        case 'gabor': return Math.exp(-(x*x+y*y)/(2*4*4)) * Math.cos(x * freq + t * 0.05)
        default: return 0.5
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.02

      const t = tRef.current
      const mapSize = 48
      const gap = 8
      const cols = Math.min(numFilters, 6)
      const rows = Math.ceil(numFilters / cols)
      const startX = (W - cols * (mapSize + gap)) / 2
      const startY = (H - rows * (mapSize + gap)) / 2

      for (let fi = 0; fi < numFilters; fi++) {
        const col = fi % cols
        const row = Math.floor(fi / cols)
        const ox = startX + col * (mapSize + gap)
        const oy = startY + row * (mapSize + gap)

        // Draw feature map
        const imgData = ctx.createImageData(mapSize, mapSize)
        for (let py = 0; py < mapSize; py++) {
          for (let px = 0; px < mapSize; px++) {
            const val = getFilterResponse(fi, px / mapSize * 8 - 4, py / mapSize * 8 - 4, t)
            const clamped = Math.max(0, Math.min(1, val))
            const idx = (py * mapSize + px) * 4
            // Colormap: viridis-like
            const r = Math.round(clamped * 100 + (1-clamped) * 68)
            const g = Math.round(clamped * 200 + (1-clamped) * 1)
            const bv = Math.round(clamped * 100 + (1-clamped) * 84)
            imgData.data[idx] = r; imgData.data[idx+1] = g; imgData.data[idx+2] = bv; imgData.data[idx+3] = 255
          }
        }

        // Create temp canvas for scaling
        const tmpCanvas = document.createElement('canvas')
        tmpCanvas.width = mapSize; tmpCanvas.height = mapSize
        tmpCanvas.getContext('2d')!.putImageData(imgData, 0, 0)
        ctx.drawImage(tmpCanvas, ox, oy, mapSize, mapSize)

        ctx.strokeStyle = '#334155'; ctx.lineWidth = 1
        ctx.strokeRect(ox, oy, mapSize, mapSize)

        // Label
        ctx.fillStyle = '#64748b'; ctx.font = '8px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`Filter ${fi+1}`, ox + mapSize/2, oy + mapSize + 10)
      }

      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      ctx.fillText(`${numFilters} Feature Maps — ${filterType.toUpperCase()} filters`, W/2, 14)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [numFilters, filterType, animating])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="Feature Map Config">
          <Slider label="Number of Filters" value={numFilters} min={1} max={16} onChange={setNumFilters} />
          <Select label="Filter Type" value={filterType}
            options={[{value:'edge',label:'Edge Detection'},{value:'texture',label:'Texture'},{value:'color',label:'Color Response'},{value:'gabor',label:'Gabor Filter'}]}
            onChange={setFilterType} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 text-sm">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          Each filter in a conv layer learns to detect a different pattern — edges, textures, colors, shapes.<br /><br />
          Early layers detect low-level features (edges). Deeper layers detect complex patterns (eyes, wheels, etc.).
        </ExplanationBox>
      </div>
      <div className="md:col-span-2 bg-slate-900 rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 240 }}>
        <canvas ref={canvasRef} width={600} height={240} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 4: Parameter Sharing
// ─────────────────────────────────────────────
function ParamShareLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const tRef = useRef(0)
  const [mode, setMode] = useState<'cnn' | 'fc'>('cnn')
  const [animating, setAnimating] = useState(false)

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

      if (mode === 'cnn') {
        // Show CNN parameter sharing: same filter applied at different positions
        const inputCells = 7
        const cellSize = 36
        const filterSize = 3
        const inputX = 30, inputY = (H - inputCells * cellSize) / 2
        const filterColors = ['#3b82f6', '#f97316', '#10b981']

        // Input grid
        ctx.fillStyle = '#64748b'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
        ctx.fillText('Input', inputX + (inputCells * cellSize) / 2, inputY - 12)
        for (let r = 0; r < inputCells; r++) {
          for (let c = 0; c < inputCells; c++) {
            ctx.fillStyle = '#1e293b'
            ctx.fillRect(inputX + c * cellSize, inputY + r * cellSize, cellSize - 2, cellSize - 2)
            ctx.strokeStyle = '#334155'; ctx.lineWidth = 1
            ctx.strokeRect(inputX + c * cellSize, inputY + r * cellSize, cellSize - 2, cellSize - 2)
          }
        }

        // Show 3 filter applications with SAME filter (same color = same weights)
        const positions = [[0,0],[2,2],[4,4]]
        positions.forEach(([pr, pc], pi) => {
          const isActive = animating && Math.floor(t * 2) % positions.length === pi
          const color = filterColors[pi % filterColors.length]
          for (let fr = 0; fr < filterSize; fr++) {
            for (let fc = 0; fc < filterSize; fc++) {
              const fx = inputX + (pc + fc) * cellSize
              const fy = inputY + (pr + fr) * cellSize
              ctx.fillStyle = `${color}${isActive ? '44' : '22'}`
              ctx.fillRect(fx, fy, cellSize - 2, cellSize - 2)
              ctx.strokeStyle = isActive ? color : color + '66'; ctx.lineWidth = isActive ? 2.5 : 1.5
              ctx.strokeRect(fx, fy, cellSize - 2, cellSize - 2)
            }
          }

          // Draw mini filter
          const miniX = inputX + inputCells * cellSize + 30 + pi * 90
          const miniY = H / 2 - (filterSize * 20) / 2 - 30
          ctx.fillStyle = '#64748b'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(`Position ${pi+1}`, miniX + filterSize * 10, miniY - 10)
          for (let fr = 0; fr < filterSize; fr++) {
            for (let fc = 0; fc < filterSize; fc++) {
              ctx.fillStyle = `${color}${isActive ? '55' : '33'}`
              ctx.fillRect(miniX + fc * 20, miniY + fr * 20, 18, 18)
              ctx.strokeStyle = color; ctx.lineWidth = isActive ? 2 : 1.2
              ctx.strokeRect(miniX + fc * 20, miniY + fr * 20, 18, 18)
            }
          }
          ctx.fillStyle = color; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'
          ctx.fillText('SAME WEIGHTS', miniX + filterSize * 10, miniY + filterSize * 20 + 14)
          ctx.fillStyle = isActive ? '#10b981' : '#334155'
          ctx.fillText(isActive ? '▶ ACTIVE' : 'shared', miniX + filterSize * 10, miniY + filterSize * 20 + 26)
        })

        ctx.fillStyle = '#10b981'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`CNN: 1 filter = ${filterSize*filterSize} params shared across all ${(inputCells-filterSize+1)**2} positions`, W/2, H-10)

      } else {
        // Fully connected: every neuron has unique weights
        const nIn = 8, nOut = 6
        const inX = 80, outX = W - 80
        const inSpacing = (H - 80) / (nIn - 1)
        const outSpacing = (H - 80) / (nOut - 1)

        ctx.fillStyle = '#ef4444'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
        ctx.fillText(`Fully Connected: ${nIn}×${nOut} = ${nIn*nOut} unique weights`, W/2, 18)

        const activeConn = animating ? Math.floor(t * nIn * nOut * 0.3) % (nIn * nOut + 1) : -1

        for (let i = 0; i < nIn; i++) {
          for (let j = 0; j < nOut; j++) {
            const connIdx = i * nOut + j
            const isActive = connIdx <= activeConn
            const iy = 40 + i * inSpacing
            const oy = 40 + j * outSpacing
            ctx.beginPath(); ctx.moveTo(inX + 14, iy); ctx.lineTo(outX - 14, oy)
            ctx.strokeStyle = isActive ? `hsl(${connIdx * 15}, 70%, 55%)` : 'rgba(71,85,105,0.15)'
            ctx.lineWidth = isActive ? 1.5 : 0.5; ctx.stroke()
          }
        }

        for (let i = 0; i < nIn; i++) {
          const iy = 40 + i * inSpacing
          ctx.beginPath(); ctx.arc(inX, iy, 14, 0, Math.PI*2)
          ctx.fillStyle = '#1e293b'; ctx.fill()
          ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 1.5; ctx.stroke()
          ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(`x${i+1}`, inX, iy + 4)
        }
        for (let j = 0; j < nOut; j++) {
          const oy = 40 + j * outSpacing
          ctx.beginPath(); ctx.arc(outX, oy, 14, 0, Math.PI*2)
          ctx.fillStyle = '#1e293b'; ctx.fill()
          ctx.strokeStyle = '#f97316'; ctx.lineWidth = 1.5; ctx.stroke()
          ctx.fillStyle = '#94a3b8'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(`y${j+1}`, outX, oy + 4)
        }
        ctx.fillStyle = '#475569'; ctx.font = '10px monospace'; ctx.textAlign = 'center'
        ctx.fillText('Each connection = unique weight (no sharing)', W/2, H-10)
      }
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode, animating])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm p-3 sm:p-4">
        <ControlSection title="Mode">
          <button onClick={() => setMode('cnn')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm mb-1.5 font-medium transition-colors ${mode==='cnn' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
            CNN (Parameter Sharing)
          </button>
          <button onClick={() => setMode('fc')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${mode==='fc' ? 'bg-red-500 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
            Fully Connected (No Sharing)
          </button>
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3 text-sm">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Parameter Sharing:</strong> In CNNs, the same filter weights are applied at every spatial position.<br /><br />
          A 3×3 filter = 9 params regardless of input size.<br />
          FC layer with 100 inputs → 50 outputs = 5,000 params.<br /><br />
          This is why CNNs are so efficient!
        </ExplanationBox>
      </div>
      <div className="md:col-span-2 bg-slate-900 rounded-lg sm:rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 240 }}>
        <canvas ref={canvasRef} width={580} height={240} className="w-full h-full" />
      </div>
    </div>
  )
}
