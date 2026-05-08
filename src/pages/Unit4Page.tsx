import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Slider, Select, ControlSection, Button, InfoBadge, ExplanationBox } from '../components/ControlPanel'
import RNNCanvas from '../labs/RNNCanvas'
import { Play, Pause, RotateCcw } from 'lucide-react'

type Lab4 = 'rnn' | 'birnn' | 'seq2seq' | 'bptt' | 'lstm'

const LABS: { id: Lab4; label: string }[] = [
  { id: 'rnn', label: 'RNN Unrolled' },
  { id: 'birnn', label: 'Bidirectional RNN' },
  { id: 'seq2seq', label: 'Seq2Seq' },
  { id: 'bptt', label: 'BPTT' },
  { id: 'lstm', label: 'LSTM Gates' },
]

export default function Unit4Page() {
  const [activeLab, setActiveLab] = useState<Lab4>('rnn')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const labParam = searchParams.get('lab')
    if (labParam) {
      const labMap: Record<string, Lab4> = {
        'rnn-unrolled': 'rnn',
        'bidirectional-rnn': 'birnn',
        'seq2seq': 'seq2seq',
        'bptt': 'bptt',
        'lstm-gates': 'lstm',
      }
      const mappedLab = labMap[labParam] as Lab4
      if (mappedLab) setActiveLab(mappedLab)
    }
  }, [searchParams])

  return (
    <div className="p-4 max-w-7xl mx-auto animate-fadeInUp">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-slate-800">Chapter IV – Recurrent Neural Networks</h1>
        <p className="text-sm text-slate-500">RNN · Bidirectional · Seq2Seq · BPTT · LSTM Gates</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-5 bg-white border border-slate-200 rounded-xl p-1.5">
        {LABS.map(lab => (
          <button key={lab.id} onClick={() => setActiveLab(lab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeLab === lab.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
            {lab.label}
          </button>
        ))}
      </div>
      {activeLab === 'rnn' && <RNNLab />}
      {activeLab === 'birnn' && <BiRNNLab />}
      {activeLab === 'seq2seq' && <Seq2SeqLab />}
      {activeLab === 'bptt' && <BPTTLab />}
      {activeLab === 'lstm' && <LSTMLab />}
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 1: RNN Unrolled
// ─────────────────────────────────────────────
function RNNLab() {
  const [steps, setSteps] = useState(5)
  const [animating, setAnimating] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="RNN Config">
          <Slider label="Sequence Length (T)" value={steps} min={2} max={6} onChange={setSteps} />
        </ControlSection>
        <InfoBadge label="Timesteps" value={steps} color="orange" />
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? <><Pause size={14} className="inline mr-1"/>Pause</> : <><Play size={14} className="inline mr-1"/>Animate</>}
        </Button>
        <ExplanationBox>
          <strong>RNN Unrolled Through Time:</strong><br />
          The same RNN cell is applied at each timestep t, sharing weights W, U, b.<br /><br />
          <code>hₜ = tanh(W·xₜ + U·hₜ₋₁ + b)</code><br /><br />
          Blue arrows = hidden state passing forward.<br />
          Green arrows = input at each step.<br />
          Orange arrows = output at each step.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3">
        <p className="text-xs text-slate-400 font-medium mb-2">RNN – Unrolled Through Time</p>
        <RNNCanvas mode="rnn" steps={steps} animating={animating} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 2: Bidirectional RNN
// ─────────────────────────────────────────────
function BiRNNLab() {
  const [steps, setSteps] = useState(5)
  const [animating, setAnimating] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="BiRNN Config">
          <Slider label="Sequence Length" value={steps} min={3} max={6} onChange={setSteps} />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mt-2 mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Bidirectional RNN:</strong><br />
          Two RNN layers process the sequence in opposite directions.<br /><br />
          <strong>→ Forward RNN:</strong> processes x₁→x₂→...→xₙ<br />
          <strong>← Backward RNN:</strong> processes xₙ→...→x₂→x₁<br /><br />
          Outputs are concatenated: yₜ = [h→ₜ ; h←ₜ]<br />
          Useful for NLP tasks needing full context.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3">
        <p className="text-xs text-slate-400 font-medium mb-2">Bidirectional RNN – Both Directions</p>
        <RNNCanvas mode="birnn" steps={steps} animating={animating} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 3: Seq2Seq
// ─────────────────────────────────────────────
function Seq2SeqLab() {
  const [animating, setAnimating] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Seq2Seq (Encoder-Decoder):</strong><br /><br />
          <strong>Encoder:</strong> Reads input sequence x₁…xₙ → produces context vector C<br /><br />
          <strong>Context Vector:</strong> Compressed summary of the entire input<br /><br />
          <strong>Decoder:</strong> Generates output sequence y₁…yₘ conditioned on C<br /><br />
          Used in: Machine translation, summarization, chatbots.
        </ExplanationBox>
        <div className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-2 rounded bg-blue-500 inline-block"></span><span>Encoder hidden states</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-2 rounded bg-violet-500 inline-block"></span><span>Context vector</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-2 rounded bg-orange-500 inline-block"></span><span>Decoder hidden states</span></div>
        </div>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3">
        <p className="text-xs text-slate-400 font-medium mb-2">Seq2Seq – Encoder → Context → Decoder</p>
        <RNNCanvas mode="seq2seq" steps={3} animating={animating} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 4: BPTT
// ─────────────────────────────────────────────
function BPTTLab() {
  const [steps, setSteps] = useState(5)
  const [animating, setAnimating] = useState(false)
  const [truncate, setTruncate] = useState(false)
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <ControlSection title="BPTT Config">
          <Slider label="Sequence Length" value={steps} min={3} max={6} onChange={setSteps} />
        </ControlSection>
        <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <input type="checkbox" id="trunc" checked={truncate} onChange={e => setTruncate(e.target.checked)} className="accent-blue-500" />
          <label htmlFor="trunc" className="text-sm text-slate-600">Truncated BPTT</label>
        </div>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>Backpropagation Through Time (BPTT):</strong><br /><br />
          Forward pass processes t=1…T.<br />
          Backward pass propagates gradients from t=T back to t=1.<br /><br />
          <strong>Problem:</strong> Vanishing/exploding gradients for long sequences.<br /><br />
          <strong>Truncated BPTT:</strong> Only backpropagate k steps instead of full T.
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3">
        <p className="text-xs text-slate-400 font-medium mb-2">BPTT – Gradient Flow Backward Through Time</p>
        <RNNCanvas mode="bptt" steps={steps} animating={animating} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Lab 5: LSTM Gates
// ─────────────────────────────────────────────
function LSTMLab() {
  const [animating, setAnimating] = useState(false)
  const [forgetGate, setForgetGate] = useState(0.7)
  const [inputGate, setInputGate] = useState(0.5)
  const [cellUpdate, setCellUpdate] = useState(0.3)
  const [outputGate, setOutputGate] = useState(0.8)

  // Simulate LSTM cell state
  const cellState = forgetGate * 0.9 + inputGate * cellUpdate
  const hiddenState = outputGate * Math.tanh(cellState)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-1">
        <ControlSection title="Gate Controls">
          <Slider label="Forget Gate (f)" value={forgetGate} min={0} max={1} step={0.01} onChange={setForgetGate} unit="" />
          <Slider label="Input Gate (i)" value={inputGate} min={0} max={1} step={0.01} onChange={setInputGate} unit="" />
          <Slider label="Cell Update (g)" value={cellUpdate} min={-1} max={1} step={0.01} onChange={setCellUpdate} unit="" />
          <Slider label="Output Gate (o)" value={outputGate} min={0} max={1} step={0.01} onChange={setOutputGate} unit="" />
        </ControlSection>
        <ControlSection title="LSTM State">
          <InfoBadge label="Cell State Cₜ" value={cellState.toFixed(4)} color="violet" />
          <InfoBadge label="Hidden State hₜ" value={hiddenState.toFixed(4)} color="orange" />
        </ControlSection>
        <Button onClick={() => setAnimating(a => !a)} variant={animating ? 'danger' : 'primary'} className="w-full mb-3">
          {animating ? 'Pause' : 'Animate'}
        </Button>
        <ExplanationBox>
          <strong>LSTM Equations:</strong><br />
          <code>f = σ(Wf·[h,x] + bf)</code> – Forget<br />
          <code>i = σ(Wi·[h,x] + bi)</code> – Input<br />
          <code>g = tanh(Wg·[h,x])</code> – Candidate<br />
          <code>Cₜ = f·Cₜ₋₁ + i·g</code> – Cell<br />
          <code>o = σ(Wo·[h,x] + bo)</code> – Output<br />
          <code>hₜ = o·tanh(Cₜ)</code> – Hidden
        </ExplanationBox>
      </div>
      <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-3">
        <p className="text-xs text-slate-400 font-medium mb-2">LSTM – Gate Mechanics (use sliders to control)</p>
        <RNNCanvas
          mode="lstm" steps={1} animating={animating}
          lstmGates={{ forget: forgetGate, input: inputGate, cell: cellUpdate, output: outputGate }}
        />
        {/* Gate meaning guide */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { name: 'Forget Gate', color: 'bg-red-900 border-red-700', desc: `f=${forgetGate.toFixed(2)}: ${forgetGate < 0.3 ? 'erase' : forgetGate > 0.7 ? 'keep' : 'partial'}` },
            { name: 'Input Gate', color: 'bg-blue-900 border-blue-700', desc: `i=${inputGate.toFixed(2)}: ${inputGate < 0.3 ? 'block' : inputGate > 0.7 ? 'write' : 'partial'}` },
            { name: 'Cell Update', color: 'bg-emerald-900 border-emerald-700', desc: `g=${cellUpdate.toFixed(2)}` },
            { name: 'Output Gate', color: 'bg-orange-900 border-orange-700', desc: `o=${outputGate.toFixed(2)}: controls hₜ` },
          ].map(g => (
            <div key={g.name} className={`rounded-lg p-2 border ${g.color}`}>
              <p className="text-xs font-medium text-slate-300 mb-0.5">{g.name}</p>
              <p className="text-xs text-slate-400 font-mono">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
