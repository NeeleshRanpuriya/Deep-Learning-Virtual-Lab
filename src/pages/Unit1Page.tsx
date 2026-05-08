import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Slider, Select, ControlSection, Button, InfoBadge, ExplanationBox } from '../components/ControlPanel'
import NeuralNetCanvas from '../labs/NeuralNetCanvas'
import PerceptronCanvas from '../labs/PerceptronCanvas'
import ActivationChart from '../labs/ActivationChart'
import LossChart from '../labs/LossChart'
import {
  buildNetwork, buildOptimizerState, forwardPass, backwardPass, updateWeights,
  computeLoss, generateXORData, generateCircleData,
  NetworkConfig, LayerState, OptimizerState, ActivationFn, OptimizerType, LossFn
} from '../utils/nnEngine'
import { Play, Pause, RotateCcw, Zap, ChevronDown } from 'lucide-react'

type Lab = 'perceptron' | 'nn_builder' | 'activation' | 'optimizer' | 'loss' | 'overfit'

const LABS = [
  { id: 'perceptron', label: 'Perceptron' },
  { id: 'nn_builder', label: 'NN Builder' },
  { id: 'activation', label: 'Activations' },
  { id: 'optimizer', label: 'Optimizers' },
  { id: 'loss', label: 'Loss Curves' },
  { id: 'overfit', label: 'Overfitting' },
] as const

export default function Unit1Page() {
  const [activeLab, setActiveLab] = useState<Lab>('perceptron')

  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeInUp">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">Unit I – Foundations of Deep Learning</h1>
        <p className="text-sm text-slate-500">Perceptron, Neural Networks, Activations, Optimizers, Loss Functions</p>
      </div>

      {/* Lab Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-1.5">
        {LABS.map(lab => (
          <button
            key={lab.id}
            onClick={() => setActiveLab(lab.id as Lab)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeLab === lab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lab.label}
          </button>
        ))}
      </div>

      {activeLab === 'perceptron' && <PerceptronLab />}
      {activeLab === 'nn_builder' && <NNBuilderLab />}
      {activeLab === 'activation' && <ActivationLab />}
      {activeLab === 'optimizer' && <OptimizerLab />}
      {activeLab === 'loss' && <LossCurveLab />}
      {activeLab === 'overfit' && <OverfitLab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 1: Perceptron
// ─────────────────────────────────────────────
function PerceptronLab() {
  const [inputs, setInputs] = useState([0.5, 0.8, -0.3])
  const [weights, setWeights] = useState([0.4, -0.6, 0.9])
  const [bias, setBias] = useState(0.1)
  const [activation, setActivation] = useState<ActivationFn>('sigmoid')
  const [animating, setAnimating] = useState(false)

  const z = inputs.reduce((s, x, i) => s + x * weights[i], bias)
  const output = (() => {
    const fns: Record<string, (x: number) => number> = {
      sigmoid: x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
      tanh: x => Math.tanh(x), relu: x => Math.max(0, x), linear: x => x,
    }
    return (fns[activation] || fns.sigmoid)(z)
  })()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Inputs">
          {inputs.map((v, i) => (
            <Slider key={i} label={`x${i+1}`} value={v} min={-2} max={2} step={0.1}
              onChange={val => setInputs(p => p.map((x, j) => j === i ? val : x))} />
          ))}
        </ControlSection>
        <ControlSection title="Weights">
          {weights.map((v, i) => (
            <Slider key={i} label={`w${i+1}`} value={v} min={-2} max={2} step={0.1}
              onChange={val => setWeights(p => p.map((x, j) => j === i ? val : x))} />
          ))}
          <Slider label="Bias (b)" value={bias} min={-2} max={2} step={0.1} onChange={setBias} />
        </ControlSection>
        <ControlSection title="Activation">
          <Select label="Function" value={activation} onChange={v => setActivation(v as ActivationFn)}
            options={[
              { value: 'sigmoid', label: 'Sigmoid' }, { value: 'tanh', label: 'Tanh' },
              { value: 'relu', label: 'ReLU' }, { value: 'linear', label: 'Linear' }
            ]} />
        </ControlSection>
        <InfoBadge label="Weighted Sum (z)" value={z.toFixed(4)} color="blue" />
        <InfoBadge label="Output f(z)" value={output.toFixed(4)} color="green" />
        <Button onClick={() => setAnimating(a => !a)} variant="primary" className="w-full mt-2">
          {animating ? <><Pause size={14} className="inline mr-1" />Pause</> : <><Play size={14} className="inline mr-1" />Animate</>}
        </Button>
        <ExplanationBox>
          <strong>Perceptron:</strong> z = Σ(xᵢ·wᵢ) + b, output = f(z).
          Adjust weights and inputs to see how the signal flows through a single neuron.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden" style={{ minHeight: 340 }}>
        <PerceptronCanvas inputs={inputs} weights={weights} bias={bias}
          activation={activation} output={output} animating={animating} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 2: Neural Network Builder
// ─────────────────────────────────────────────
function NNBuilderLab() {
  const [inputSize, setInputSize] = useState(2)
  const [hiddenLayers, setHiddenLayers] = useState([{ size: 4, activation: 'relu' as ActivationFn }])
  const [outputSize] = useState(1)
  const [activation, setActivation] = useState<ActivationFn>('relu')
  const [optimizer, setOptimizer] = useState<OptimizerType>('adam')
  const [lossFn, setLossFn] = useState<LossFn>('bce')
  const [lr, setLr] = useState(0.01)
  const [epochs, setEpochs] = useState(100)
  const [batchSize, setBatchSize] = useState(16)
  const [training, setTraining] = useState(false)
  const [lossHistory, setLossHistory] = useState<{ epoch: number; loss: number; acc: number }[]>([])
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [layers, setLayers] = useState<LayerState[]>([])
  const [signalPhase, setSignalPhase] = useState<'idle' | 'forward' | 'backward'>('idle')
  const [signalProgress, setSignalProgress] = useState(0)
  const [hoveredNeuron, setHoveredNeuron] = useState<{ layer: number; idx: number } | null>(null)
  const [lossVal, setLossVal] = useState(0)
  const [accVal, setAccVal] = useState(0)
  const netRef = useRef<{ layers: LayerState[]; opt: OptimizerState; cfg: NetworkConfig } | null>(null)
  const trainingRef = useRef(false)
  const rafRef = useRef(0)

  const layerSizes = [inputSize, ...hiddenLayers.map(l => l.size), outputSize]

  const buildCfg = useCallback((): NetworkConfig => ({
    inputSize, hiddenLayers, outputSize, outputActivation: 'sigmoid',
    optimizer, loss: lossFn, learningRate: lr
  }), [inputSize, hiddenLayers, outputSize, optimizer, lossFn, lr])

  const initNetwork = useCallback(() => {
    const cfg = buildCfg()
    const newLayers = buildNetwork(cfg)
    const opt = buildOptimizerState(newLayers)
    netRef.current = { layers: newLayers, opt, cfg }
    setLayers(newLayers.map(l => ({ ...l })))
    setLossHistory([])
    setCurrentEpoch(0)
    setSignalPhase('idle')
  }, [buildCfg])

  useEffect(() => { initNetwork() }, [])

  const addHiddenLayer = () => {
    setHiddenLayers(h => [...h, { size: 4, activation }])
  }
  const removeHiddenLayer = (i: number) => {
    setHiddenLayers(h => h.filter((_, j) => j !== i))
  }
  const updateLayer = (i: number, size: number) => {
    setHiddenLayers(h => h.map((l, j) => j === i ? { ...l, size } : l))
  }

  const runTraining = useCallback(async () => {
    if (!netRef.current) return
    const { inputs: data, targets } = generateXORData(200)
    trainingRef.current = true
    let ep = currentEpoch

    const trainStep = () => {
      if (!trainingRef.current || ep >= epochs || !netRef.current) {
        setTraining(false)
        setSignalPhase('idle')
        return
      }
      const { layers: ls, opt, cfg } = netRef.current
      const n = data.length
      let totalLoss = 0, correct = 0

      // Mini-batch
      for (let b = 0; b < batchSize; b++) {
        const idx = Math.floor(Math.random() * n)
        const pred = forwardPass(data[idx], ls, cfg)
        totalLoss += computeLoss(pred, targets[idx], cfg.loss)
        if (Math.round(pred[0]) === targets[idx][0]) correct++
        backwardPass(data[idx], targets[idx], ls, cfg)
        updateWeights(ls, opt, cfg)
      }

      const avgLoss = totalLoss / batchSize
      const acc = correct / batchSize

      ep++
      setCurrentEpoch(ep)
      setLossVal(avgLoss)
      setAccVal(acc)
      setLossHistory(h => [...h, { epoch: ep, loss: +avgLoss.toFixed(4), acc: +acc.toFixed(3) }].slice(-200))
      setLayers(ls.map(l => ({ ...l })))

      // Animate signal
      const isForward = ep % 2 === 0
      setSignalPhase(isForward ? 'forward' : 'backward')
      setSignalProgress((ep % 20) / 20)

      rafRef.current = requestAnimationFrame(trainStep)
    }

    trainStep()
  }, [currentEpoch, epochs, batchSize])

  const handleTrain = () => {
    if (training) {
      trainingRef.current = false
      setTraining(false)
      cancelAnimationFrame(rafRef.current)
    } else {
      if (!netRef.current || currentEpoch === 0) initNetwork()
      setTraining(true)
      setTimeout(runTraining, 50)
    }
  }

  const activations = layers.map(l => l.a)
  const weights = layers.map(l => l.weights)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 680 }}>
        <ControlSection title="Architecture">
          <Slider label="Input Neurons" value={inputSize} min={1} max={8} onChange={v => { setInputSize(v); trainingRef.current = false; setTraining(false) }} />
          {hiddenLayers.map((l, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <Slider label={`Hidden Layer ${i+1}`} value={l.size} min={1} max={16}
                  onChange={val => updateLayer(i, val)} />
              </div>
              <button onClick={() => removeHiddenLayer(i)} className="text-slate-400 hover:text-red-500 text-xs mt-1">✕</button>
            </div>
          ))}
          <Button onClick={addHiddenLayer} variant="secondary" className="w-full text-xs">+ Add Hidden Layer</Button>
        </ControlSection>
        <ControlSection title="Model Config">
          <Select label="Activation" value={activation}
            options={[
              { value: 'relu', label: 'ReLU' }, { value: 'leaky_relu', label: 'Leaky ReLU' },
              { value: 'elu', label: 'ELU' }, { value: 'sigmoid', label: 'Sigmoid' },
              { value: 'tanh', label: 'Tanh' }, { value: 'linear', label: 'Linear' }
            ]}
            onChange={v => { setActivation(v as ActivationFn); setHiddenLayers(h => h.map(l => ({ ...l, activation: v as ActivationFn }))) }} />
          <Select label="Optimizer" value={optimizer}
            options={[
              { value: 'sgd', label: 'SGD' }, { value: 'momentum', label: 'Momentum' },
              { value: 'rmsprop', label: 'RMSProp' }, { value: 'adam', label: 'Adam' }
            ]}
            onChange={v => setOptimizer(v as OptimizerType)} />
          <Select label="Loss Function" value={lossFn}
            options={[
              { value: 'mse', label: 'MSE' }, { value: 'mae', label: 'MAE' },
              { value: 'bce', label: 'Binary Cross-Entropy' }, { value: 'cce', label: 'Categorical CE' }
            ]}
            onChange={v => setLossFn(v as LossFn)} />
          <Slider label="Learning Rate" value={lr} min={0.0001} max={0.1} step={0.0001} onChange={setLr} />
          <Slider label="Epochs" value={epochs} min={10} max={500} step={10} onChange={setEpochs} />
          <Slider label="Batch Size" value={batchSize} min={4} max={64} step={4} onChange={setBatchSize} />
        </ControlSection>
        <div className="flex gap-2">
          <Button onClick={handleTrain} variant={training ? 'danger' : 'primary'} className="flex-1">
            {training ? <><Pause size={14} className="inline mr-1" />Stop</> : <><Play size={14} className="inline mr-1" />Train</>}
          </Button>
          <Button onClick={() => { trainingRef.current = false; setTraining(false); initNetwork() }} variant="secondary">
            <RotateCcw size={14} />
          </Button>
        </div>
        <InfoBadge label="Epoch" value={`${currentEpoch} / ${epochs}`} color="blue" />
        <InfoBadge label="Loss" value={lossVal.toFixed(4)} color="orange" />
        <InfoBadge label="Accuracy" value={`${(accVal * 100).toFixed(1)}%`} color="green" />
        <ExplanationBox>
          Training on XOR dataset. Forward pass → compute loss → backprop → weight update.
          Hover over neurons to see activation values.
        </ExplanationBox>
      </div>

      {/* Canvas */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden" style={{ height: 400 }}>
          <div className="flex items-center gap-2 px-3 pt-2 pb-1">
            <span className="text-xs text-slate-400 font-mono">Architecture: [{layerSizes.join(' → ')}]</span>
            {signalPhase !== 'idle' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${signalPhase === 'forward' ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'}`}>
                {signalPhase === 'forward' ? '→ Forward' : '← Backward'}
              </span>
            )}
          </div>
          <NeuralNetCanvas
            layers={layerSizes}
            activations={[new Array(inputSize).fill(0.5), ...activations]}
            weights={weights}
            signalPhase={signalPhase}
            signalProgress={signalProgress}
            hoveredNeuron={hoveredNeuron}
            onNeuronHover={setHoveredNeuron}
          />
        </div>
        <LossChart data={lossHistory} title="Training Loss & Accuracy" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 3: Activation Functions
// ─────────────────────────────────────────────
function ActivationLab() {
  const [selected, setSelected] = useState<ActivationFn>('relu')
  const fns: ActivationFn[] = ['relu', 'leaky_relu', 'elu', 'sigmoid', 'tanh', 'linear']
  const descriptions: Record<ActivationFn, string> = {
    relu: 'f(x) = max(0, x). Simple, fast, and commonly used in deep networks. Suffers from "dying ReLU" problem.',
    leaky_relu: 'f(x) = x if x≥0, 0.01x otherwise. Fixes dying ReLU by allowing small negative gradients.',
    elu: 'f(x) = x if x≥0, α(eˣ−1) otherwise. Smoother than ReLU, can have negative values.',
    sigmoid: 'f(x) = 1/(1+e⁻ˣ). Outputs ∈(0,1). Used in binary classification output. Suffers from vanishing gradients.',
    tanh: 'f(x) = (eˣ−e⁻ˣ)/(eˣ+e⁻ˣ). Zero-centered, outputs ∈(−1,1). Better than sigmoid for hidden layers.',
    linear: 'f(x) = x. No non-linearity. Used only in regression output layers.',
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Activation Function">
          {fns.map(fn => (
            <button key={fn} onClick={() => setSelected(fn)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${
                selected === fn ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {fn.toUpperCase().replace('_', ' ')}
            </button>
          ))}
        </ControlSection>
        <ExplanationBox>
          <strong>{selected.toUpperCase().replace('_', ' ')}:</strong><br />
          {descriptions[selected]}
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 p-4">
        <p className="text-xs text-slate-400 mb-3 font-medium">Activation Function + Derivative</p>
        <ActivationChart fn={selected} width={560} height={320} />
        <div className="mt-3 flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-blue-500 inline-block"></span> f(x)</span>
          <span className="flex items-center gap-1"><span className="w-6 h-0.5 bg-orange-400 inline-block"></span> f'(x)</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {fns.map(fn => (
            <div key={fn} className="bg-slate-800 rounded-lg p-2 cursor-pointer hover:bg-slate-700" onClick={() => setSelected(fn)}>
              <p className="text-xs text-slate-400 mb-1 text-center">{fn.replace('_', ' ')}</p>
              <ActivationChart fn={fn} width={140} height={70} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 4: Optimizer Comparison
// ─────────────────────────────────────────────
function OptimizerLab() {
  const [running, setRunning] = useState(false)
  const [lr, setLr] = useState(0.01)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)
  const runRef = useRef(false)

  const optimizerPaths = useRef({
    sgd: { x: -2.5, y: -2.5, color: '#ef4444', history: [] as [number, number][] },
    momentum: { x: -2.5, y: -2.5, color: '#3b82f6', history: [] as [number, number][] },
    rmsprop: { x: -2.5, y: -2.5, color: '#10b981', history: [] as [number, number][] },
    adam: { x: -2.5, y: -2.5, color: '#f97316', history: [] as [number, number][] },
  })
  const momentumState = useRef({ sgd: [0,0], mom: [0.9, 0.9], rms: [0.01, 0.01] as [number, number], adam: { m:[0,0], v:[0.01,0.01], t:0 } })

  // Rosenbrock-like loss landscape
  const lossGrad = (x: number, y: number) => ({
    fx: 2 * (x - 1) + 400 * x * (x * x - y),
    fy: -200 * (x * x - y),
  })

  const resetAll = () => {
    Object.values(optimizerPaths.current).forEach(o => { o.x = -2.5; o.y = -2.5; o.history = [] })
    momentumState.current = { sgd: [0,0], mom: [0.9,0.9], rms:[0.01,0.01], adam:{m:[0,0],v:[0.01,0.01],t:0} }
    tRef.current = 0
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    const xRange = [-3, 3], yRange = [-1, 5]
    const toCanv = (wx: number, wy: number) => ({
      cx: ((wx - xRange[0]) / (xRange[1] - xRange[0])) * W,
      cy: H - ((wy - yRange[0]) / (yRange[1] - yRange[0])) * H
    })

    function drawLandscape() {
      const imageData = ctx.createImageData(W, H)
      for (let py = 0; py < H; py++) {
        for (let px = 0; px < W; px++) {
          const wx = xRange[0] + (px / W) * (xRange[1] - xRange[0])
          const wy = yRange[0] + ((H - py) / H) * (yRange[1] - yRange[0])
          const loss = (1 - wx) ** 2 + 100 * (wy - wx * wx) ** 2
          const normalized = Math.min(1, loss / 1000)
          const i = (py * W + px) * 4
          const r = Math.round(normalized * 30 + 15)
          const g = Math.round((1 - normalized) * 40 + 10)
          const b = Math.round(normalized * 80 + 20)
          imageData.data[i] = r; imageData.data[i+1] = g; imageData.data[i+2] = b; imageData.data[i+3] = 255
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    function stepOptimizers() {
      const eps = 1e-8
      const p = optimizerPaths.current
      const s = momentumState.current

      const step = (name: string, x: number, y: number): [number, number] => {
        const { fx, fy } = lossGrad(x, y)
        switch(name) {
          case 'sgd': return [x - lr * fx, y - lr * fy]
          case 'momentum': {
            s.mom[0] = 0.9 * s.mom[0] - lr * fx
            s.mom[1] = 0.9 * s.mom[1] - lr * fy
            return [x + s.mom[0], y + s.mom[1]]
          }
          case 'rmsprop': {
            s.rms[0] = 0.9 * s.rms[0] + 0.1 * fx * fx
            s.rms[1] = 0.9 * s.rms[1] + 0.1 * fy * fy
            return [x - lr * fx / (Math.sqrt(s.rms[0]) + eps), y - lr * fy / (Math.sqrt(s.rms[1]) + eps)]
          }
          case 'adam': {
            s.adam.t++
            s.adam.m[0] = 0.9 * s.adam.m[0] + 0.1 * fx
            s.adam.m[1] = 0.9 * s.adam.m[1] + 0.1 * fy
            s.adam.v[0] = 0.999 * s.adam.v[0] + 0.001 * fx * fx
            s.adam.v[1] = 0.999 * s.adam.v[1] + 0.001 * fy * fy
            const mHx = s.adam.m[0] / (1 - 0.9 ** s.adam.t)
            const mHy = s.adam.m[1] / (1 - 0.9 ** s.adam.t)
            const vHx = s.adam.v[0] / (1 - 0.999 ** s.adam.t)
            const vHy = s.adam.v[1] / (1 - 0.999 ** s.adam.t)
            return [x - lr * mHx / (Math.sqrt(vHx) + eps), y - lr * mHy / (Math.sqrt(vHy) + eps)]
          }
          default: return [x, y]
        }
      }

      Object.entries(p).forEach(([name, o]) => {
        const [nx, ny] = step(name, o.x, o.y)
        const clamped = [Math.max(xRange[0], Math.min(xRange[1], nx)), Math.max(yRange[0], Math.min(yRange[1], ny))] as [number, number]
        o.history.push([o.x, o.y])
        if (o.history.length > 80) o.history.shift()
        o.x = clamped[0]; o.y = clamped[1]
      })
    }

    function drawPaths() {
      const p = optimizerPaths.current
      Object.entries(p).forEach(([, o]) => {
        if (o.history.length < 2) return
        ctx.beginPath()
        o.history.forEach(([hx, hy], i) => {
          const { cx, cy } = toCanv(hx, hy)
          if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
        })
        ctx.strokeStyle = o.color + 'aa'; ctx.lineWidth = 2; ctx.stroke()
        const { cx, cy } = toCanv(o.x, o.y)
        ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2)
        ctx.fillStyle = o.color; ctx.shadowColor = o.color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0
      })
    }

    function drawLegend() {
      const items = [
        { name: 'SGD', color: '#ef4444' }, { name: 'Momentum', color: '#3b82f6' },
        { name: 'RMSProp', color: '#10b981' }, { name: 'Adam', color: '#f97316' }
      ]
      items.forEach(({ name, color }, i) => {
        ctx.fillStyle = color; ctx.fillRect(8, 8 + i * 18, 14, 3)
        ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'left'
        ctx.fillText(name, 26, 14 + i * 18)
      })
      // Global minimum marker
      const { cx, cy } = toCanv(1, 1)
      ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2)
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2; ctx.stroke()
      ctx.fillStyle = '#fbbf24'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('★ min', cx, cy - 10)
    }

    function frame() {
      drawLandscape()
      if (runRef.current) stepOptimizers()
      drawPaths()
      drawLegend()
      rafRef.current = requestAnimationFrame(frame)
    }

    resetAll()
    frame()
    return () => cancelAnimationFrame(rafRef.current)
  }, [lr])

  const handleToggle = () => {
    if (running) { runRef.current = false; setRunning(false) }
    else { runRef.current = true; setRunning(true) }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Settings">
          <Slider label="Learning Rate" value={lr} min={0.0001} max={0.05} step={0.0001} onChange={setLr} />
        </ControlSection>
        <div className="flex gap-2 mb-3">
          <Button onClick={handleToggle} variant={running ? 'danger' : 'primary'} className="flex-1">
            {running ? <><Pause size={14} className="inline mr-1" />Pause</> : <><Play size={14} className="inline mr-1" />Run</>}
          </Button>
          <Button onClick={() => { runRef.current = false; setRunning(false); resetAll() }} variant="secondary">
            <RotateCcw size={14} />
          </Button>
        </div>
        <div className="space-y-1.5">
          {[{ name:'SGD', color:'text-red-500', desc:'Vanilla gradient descent'}, {name:'Momentum', color:'text-blue-500', desc:'Accumulates velocity'}, {name:'RMSProp', color:'text-emerald-500', desc:'Adaptive per-param lr'}, {name:'Adam', color:'text-orange-500', desc:'Momentum + RMSProp'}].map(o => (
            <div key={o.name} className="flex items-start gap-2 text-xs">
              <span className={`font-bold w-16 ${o.color}`}>{o.name}</span>
              <span className="text-slate-500">{o.desc}</span>
            </div>
          ))}
        </div>
        <ExplanationBox>
          <strong>Rosenbrock Function:</strong> f(x,y) = (1−x)² + 100(y−x²)²<br />
          Global minimum at (1,1). Each optimizer takes a different path to reach it.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <canvas ref={canvasRef} width={580} height={400} className="w-full h-full" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 5: Loss Curves
// ─────────────────────────────────────────────
function LossCurveLab() {
  const [running, setRunning] = useState(false)
  const [lr, setLr] = useState(0.01)
  const [history, setHistory] = useState<{epoch:number; loss:number; valLoss:number}[]>([])
  const runRef = useRef(false)
  const epRef = useRef(0)

  const run = useCallback(() => {
    if (!runRef.current) return
    epRef.current++
    const ep = epRef.current
    const baseLoss = 2.0 * Math.exp(-lr * 50 * ep * 0.01)
    const trainLoss = baseLoss + (Math.random() - 0.5) * 0.08
    const valLoss = baseLoss * 1.15 + (Math.random() - 0.5) * 0.12
    setHistory(h => [...h, { epoch: ep, loss: +trainLoss.toFixed(4), valLoss: +valLoss.toFixed(4) }].slice(-150))
    if (ep < 300) setTimeout(run, 60)
    else { runRef.current = false; setRunning(false) }
  }, [lr])

  const handleToggle = () => {
    if (running) { runRef.current = false; setRunning(false) }
    else { runRef.current = true; setRunning(true); run() }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Settings">
          <Slider label="Learning Rate" value={lr} min={0.001} max={0.1} step={0.001} onChange={setLr} />
        </ControlSection>
        <div className="flex gap-2 mb-3">
          <Button onClick={handleToggle} variant={running ? 'danger' : 'primary'} className="flex-1">
            {running ? 'Stop' : 'Simulate'}
          </Button>
          <Button onClick={() => { runRef.current=false; setRunning(false); setHistory([]); epRef.current=0 }} variant="secondary">
            <RotateCcw size={14} />
          </Button>
        </div>
        <ExplanationBox>
          <strong>Train vs Validation Loss:</strong><br />
          — Blue: Training loss<br />
          — Orange: Validation loss<br />
          When val loss diverges from train loss = overfitting. Adjust learning rate to observe convergence speed.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2">
        <LossChart data={history} title="Loss Curves (Train vs Val)" height={380} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 6: Overfitting / Underfitting
// ─────────────────────────────────────────────
function OverfitLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [degree, setDegree] = useState(3)
  const [noise, setNoise] = useState(0.3)
  const [nPoints, setNPoints] = useState(20)
  const dataRef = useRef<{x: number; y: number}[]>([])

  const generateData = useCallback(() => {
    const pts = []
    for (let i = 0; i < nPoints; i++) {
      const x = (Math.random() * 2 - 1) * Math.PI
      const y = Math.sin(x) + (Math.random() - 0.5) * noise * 2
      pts.push({ x, y })
    }
    dataRef.current = pts
  }, [nPoints, noise])

  useEffect(() => { generateData() }, [generateData])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, W, H)

    const xMin = -Math.PI, xMax = Math.PI, yMin = -3, yMax = 3
    const toC = (wx: number, wy: number) => ({
      cx: ((wx - xMin) / (xMax - xMin)) * W,
      cy: H - ((wy - yMin) / (yMax - yMin)) * H
    })

    // Grid
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1
    for (let x = -3; x <= 3; x++) { const { cx } = toC(x, 0); ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,H); ctx.stroke() }
    for (let y = -2; y <= 2; y++) { const { cy } = toC(0, y); ctx.beginPath(); ctx.moveTo(0,cy); ctx.lineTo(W,cy); ctx.stroke() }

    // Axes
    ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.5
    const ax0 = toC(0, 0); ctx.beginPath(); ctx.moveTo(0, ax0.cy); ctx.lineTo(W, ax0.cy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(ax0.cx, 0); ctx.lineTo(ax0.cx, H); ctx.stroke()

    // True function sin(x)
    ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2; ctx.setLineDash([6,4])
    for (let px = 0; px < W; px++) {
      const wx = xMin + (px / W) * (xMax - xMin)
      const { cy } = toC(wx, Math.sin(wx))
      if (px === 0) ctx.moveTo(px, cy); else ctx.lineTo(px, cy)
    }
    ctx.stroke(); ctx.setLineDash([])

    // Data points
    const pts = dataRef.current
    pts.forEach(({ x, y }) => {
      const { cx, cy } = toC(x, y)
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#3b82f6'; ctx.strokeStyle = '#60a5fa'; ctx.lineWidth = 1.5
      ctx.fill(); ctx.stroke()
    })

    // Polynomial fit (Vandermonde)
    if (pts.length >= 2) {
      const n = pts.length, d = degree + 1
      const X = pts.map(p => Array.from({length: d}, (_, k) => Math.pow(p.x, k)))
      const y = pts.map(p => p.y)
      // Least squares: (XᵀX)⁻¹Xᵀy via normal eq. (simplified for demo)
      // Use Vandermonde-style approximation
      const colors = degree <= 2 ? '#f97316' : degree <= 5 ? '#a78bfa' : '#ef4444'
      const labels = degree <= 2 ? 'Underfitting (degree too low)' : degree <= 5 ? 'Good Fit' : 'Overfitting (degree too high)'

      ctx.beginPath(); ctx.strokeStyle = colors; ctx.lineWidth = 2.5
      for (let px = 0; px < W; px++) {
        const wx = xMin + (px / W) * (xMax - xMin)
        // Simple polynomial regression prediction
        let py = 0
        const coeffs = solvePolyReg(pts.map(p => p.x), pts.map(p => p.y), degree)
        for (let k = 0; k <= degree; k++) py += (coeffs[k] || 0) * Math.pow(wx, k)
        py = Math.max(yMin, Math.min(yMax, py))
        const { cx, cy } = toC(wx, py)
        if (px === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy)
      }
      ctx.stroke()

      ctx.fillStyle = colors; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center'
      ctx.fillText(labels, W / 2, H - 8)
    }

    // Legend
    ctx.font = '9px monospace'; ctx.textAlign = 'left'
    ctx.setLineDash([6,4]); ctx.beginPath(); ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2
    ctx.moveTo(8, 16); ctx.lineTo(28, 16); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = '#64748b'; ctx.fillText('True: sin(x)', 32, 20)
    ctx.beginPath(); ctx.arc(8, 34, 4, 0, Math.PI*2); ctx.fillStyle = '#3b82f6'; ctx.fill()
    ctx.fillStyle = '#64748b'; ctx.fillText('Data points', 16, 38)
  }, [degree, noise, nPoints])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="Model Complexity">
          <Slider label="Polynomial Degree" value={degree} min={1} max={12} onChange={setDegree} />
          <Slider label="Noise Level" value={noise} min={0} max={1} step={0.05} onChange={setNoise} />
          <Slider label="Data Points" value={nPoints} min={5} max={50} onChange={setNPoints} />
        </ControlSection>
        <Button onClick={generateData} variant="secondary" className="w-full mb-3">Resample Data</Button>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span><span>Degree ≤ 2: Underfitting</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500 inline-block"></span><span>Degree 3–5: Good fit</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span>Degree ≥ 6: Overfitting</span></div>
        </div>
        <ExplanationBox>
          <strong>Bias-Variance Tradeoff:</strong><br />
          Low degree = high bias (underfitting).<br />
          High degree = high variance (overfitting).<br />
          Goal: find the sweet spot.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
        <canvas ref={canvasRef} width={580} height={400} className="w-full h-full" />
      </div>
    </div>
  )
}

// Simple polynomial regression via normal equations (Vandermonde)
function solvePolyReg(xs: number[], ys: number[], degree: number): number[] {
  const d = Math.min(degree, xs.length - 1)
  const n = xs.length
  // Build Vandermonde matrix columns up to degree d
  const V: number[][] = xs.map(x => Array.from({length: d + 1}, (_, k) => Math.pow(x, k)))
  // Compute VᵀV and Vᵀy
  const VtV: number[][] = Array.from({length: d+1}, (_, i) =>
    Array.from({length: d+1}, (_, j) => V.reduce((s, row) => s + row[i]*row[j], 0))
  )
  const Vty: number[] = Array.from({length: d+1}, (_, i) => V.reduce((s, row, ri) => s + row[i]*ys[ri], 0))
  // Gaussian elimination (simplified)
  return gaussElim(VtV, Vty)
}

function gaussElim(A: number[][], b: number[]): number[] {
  const n = A.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col+1; row < n; row++) if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    [M[col], M[maxRow]] = [M[maxRow], M[col]]
    if (Math.abs(M[col][col]) < 1e-12) continue
    for (let row = col+1; row < n; row++) {
      const f = M[row][col] / M[col][col]
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n-1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < 1e-12) continue
    x[i] = M[i][n]
    for (let j = i+1; j < n; j++) x[i] -= M[i][j] * x[j]
    x[i] /= M[i][i]
  }
  return x
}
