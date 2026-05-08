import React from 'react'
import { Link } from 'react-router-dom'
import { Brain, Network, Layers, Cpu, GitBranch, Zap, ArrowRight, BookOpen, Code2, Activity } from 'lucide-react'

const units = [
  {
    path: '/chapter1',
    unit: 'Chapter I',
    title: 'Foundations of Deep Learning',
    desc: 'Perceptron, neural network builder, activation functions, optimizers, loss curves, overfitting/underfitting.',
    icon: Network,
    color: 'blue',
    labs: ['Perceptron Visualizer', 'NN Builder', 'Activation Functions', 'Optimizer Comparison', 'Loss Curves'],
  },
  {
    path: '/chapter2',
    unit: 'Chapter II',
    title: 'Deep Network Architectures',
    desc: 'Network width vs depth, representation learning, Restricted Boltzmann Machines, basic autoencoders.',
    icon: Layers,
    color: 'violet',
    labs: ['Width vs Depth', 'Representation Learning', 'RBM Visualizer', 'Basic Autoencoder'],
  },
  {
    path: '/chapter3',
    unit: 'Chapter III',
    title: 'Convolutional Neural Networks',
    desc: 'CNN architecture blocks, filter animation, feature maps, pooling, AlexNet / ResNet / DenseNet / PixelNet.',
    icon: Cpu,
    color: 'emerald',
    labs: ['CNN Visualizer', 'Filter Sliding', 'AlexNet', 'ResNet', 'DenseNet', 'PixelNet'],
  },
  {
    path: '/chapter4',
    unit: 'Chapter IV',
    title: 'Recurrent Neural Networks',
    desc: 'RNN hidden states, Bidirectional RNN, Seq2Seq with attention, BPTT, LSTM gates animation.',
    icon: GitBranch,
    color: 'orange',
    labs: ['RNN Unrolled', 'Bidirectional RNN', 'Seq2Seq', 'BPTT', 'LSTM Gates'],
  },
  {
    path: '/chapter5',
    unit: 'Chapter V',
    title: 'Generative & Unsupervised Models',
    desc: 'Autoencoder with latent space, GAN training cycle, Boltzmann Machine, Deep Belief Network.',
    icon: Zap,
    color: 'rose',
    labs: ['Autoencoder', 'GAN Trainer', 'Boltzmann Machine', 'Deep Belief Network', 'Deep Boltzmann Machine'],
  },
]

const colorMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-100 text-blue-600',
  violet: 'bg-violet-50 border-violet-100 text-violet-600',
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  orange: 'bg-orange-50 border-orange-100 text-orange-600',
  rose: 'bg-rose-50 border-rose-100 text-rose-600',
}
const iconBg: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600',
  violet: 'bg-violet-100 text-violet-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  orange: 'bg-orange-100 text-orange-600',
  rose: 'bg-rose-100 text-rose-600',
}

export default function Home() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-fadeInUp">
      {/* Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">DeepLab 3D</h1>
            <p className="text-slate-500 text-sm">Interactive Deep Learning Visualizer</p>
          </div>
        </div>
        <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
          An interactive educational platform where you can build, train, and visualize real neural networks — 
          from basic perceptrons to GANs and LSTMs. All computations run locally using JavaScript-based 
          neural network math. No external APIs or paid services.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
            <Activity size={14} className="text-blue-500" />
            Real forward & backprop animations
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
            <Code2 size={14} className="text-blue-500" />
            JavaScript NN math engine
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
            <BookOpen size={14} className="text-blue-500" />
            5 chapters · 20+ interactive labs
          </div>
        </div>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 gap-4">
        {units.map(({ path, unit, title, desc, icon: Icon, color, labs }) => (
          <Link
            key={path}
            to={path}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-slate-300 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg[color]}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorMap[color]}`}>
                    {unit}
                  </span>
                  <h2 className="font-semibold text-slate-800 text-sm">{title}</h2>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {labs.map((lab) => (
                    <span key={lab} className="text-xs bg-slate-50 border border-slate-200 text-slate-500 rounded px-2 py-0.5">
                      {lab}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
