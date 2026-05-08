import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Brain, Menu, X, ChevronDown, Layers, Network, Cpu, GitBranch, Zap, Home,
  ChevronRight, Github, Linkedin, Globe,
  FolderTree, GraduationCap, Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/chapter1', label: 'Chapter I – Foundations', icon: Network, sub: 'Perceptron · Activations · Optimizers' },
  { path: '/chapter2', label: 'Chapter II – Deep Networks', icon: Layers, sub: 'Width · Depth · RBM · Autoencoder' },
  { path: '/chapter3', label: 'Chapter III – CNN', icon: Cpu, sub: 'AlexNet · ResNet · DenseNet · PixelNet' },
  { path: '/chapter4', label: 'Chapter IV – RNN', icon: GitBranch, sub: 'LSTM · Seq2Seq · BPTT · Bidirectional' },
  { path: '/chapter5', label: 'Chapter V – Generative', icon: Zap, sub: 'Autoencoder · GAN · DBN · Boltzmann' },
]

const chaptersData = {
  chapter1: {
    title: 'Chapter I – Foundations of Deep Learning',
    subtitle: 'Perceptron, Neural Networks, Activations, Optimizers, Loss Functions',
    sections: [
      { name: 'Perceptron', id: 'perceptron' },
      { name: 'NN Builder', id: 'nn-builder' },
      { name: 'Activations', id: 'activations' },
      { name: 'Optimizers', id: 'optimizers' },
      { name: 'Loss Curves', id: 'loss-curves' },
      { name: 'Overfitting', id: 'overfitting' },
    ]
  },
  chapter2: {
    title: 'Chapter II – Deep Network Architectures',
    subtitle: 'Width vs Depth, Representation Learning, RBMs, Autoencoders',
    sections: [
      { name: 'Width vs Depth', id: 'width-vs-depth' },
      { name: 'Representation Learning', id: 'representation-learning' },
      { name: 'RBM Visualizer', id: 'rbm-visualizer' },
      { name: 'Basic Autoencoder', id: 'basic-autoencoder' },
    ]
  },
  chapter3: {
    title: 'Chapter III – Convolutional Neural Networks',
    subtitle: 'CNN Architectures, Filters, Feature Maps, AlexNet · ResNet · DenseNet · PixelNet',
    sections: [
      { name: 'CNN Architecture', id: 'cnn-architecture' },
      { name: 'Filter Sliding', id: 'filter-sliding' },
      { name: 'Feature Maps', id: 'feature-maps' },
      { name: 'Parameter Sharing', id: 'parameter-sharing' },
    ]
  },
  chapter4: {
    title: 'Chapter IV – Recurrent Neural Networks',
    subtitle: 'RNN · Bidirectional · Seq2Seq · BPTT · LSTM Gates',
    sections: [
      { name: 'RNN Unrolled', id: 'rnn-unrolled' },
      { name: 'Bidirectional RNN', id: 'bidirectional-rnn' },
      { name: 'Seq2Seq', id: 'seq2seq' },
      { name: 'BPTT', id: 'bptt' },
      { name: 'LSTM Gates', id: 'lstm-gates' },
    ]
  },
  chapter5: {
    title: 'Chapter V – Generative & Unsupervised Models',
    subtitle: 'Autoencoder · GAN · Boltzmann Machine · DBN · DBM',
    sections: [
      { name: 'Autoencoder', id: 'autoencoder' },
      { name: 'GAN Trainer', id: 'gan-trainer' },
      { name: 'Boltzmann Machine', id: 'boltzmann-machine' },
      { name: 'Deep Belief Network', id: 'deep-belief-network' },
      { name: 'Deep Boltzmann Machine', id: 'deep-boltzmann-machine' },
    ]
  }
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openChapter, setOpenChapter] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeLab = searchParams.get('lab')

  const showSidebar = location.pathname.startsWith('/chapter')
  const currentChapterMatch = location.pathname.match(/\/chapter(\d+)/)
  const currentChapter = currentChapterMatch ? `chapter${currentChapterMatch[1]}` : null
  const currentChapterData = currentChapter && chaptersData[currentChapter]

  useEffect(() => {
    if (currentChapter && openChapter !== currentChapter) {
      setOpenChapter(currentChapter)
    }
  }, [currentChapter, openChapter])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {showSidebar && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            <Link className="flex items-center gap-2.5 group" to="/">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <Brain size={20} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-800">
                  DeepLab <span className="text-blue-600">3D</span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 -mt-0.5">
                  Interactive Learning
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-5">
            <Link
              to="/developer"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 group"
            >
              <GraduationCap size={15} className="opacity-60 group-hover:opacity-100" />
              About Developer
            </Link>

            <div className="h-5 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <a
                href="https://neelesh-ranpuriya.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-all hover:scale-105"
                aria-label="Portfolio"
              >
                <Globe size={18} />
              </a>

              <a
                href="https://github.com/NeeleshRanpuriya"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-slate-800 transition-all hover:scale-105"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>

              <a
                href="https://www.linkedin.com/in/neelesh-ranpuriya-0920512b2/?skipRedirect=true"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-[#0077b5] transition-all hover:scale-105"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {showSidebar && (
          <aside
            className={`
              relative z-40 bg-white border-r border-slate-200 shadow-xl shadow-slate-200/20
              flex flex-col overflow-y-auto transition-all duration-300 ease-in-out
              ${sidebarOpen ? 'w-80' : 'w-0 lg:w-80'}
            `}
            style={{ marginTop: '64px' }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 bg-gradient-to-r from-slate-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <FolderTree size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Learning Path
                  </p>
                  <p className="text-[11px] text-slate-500 -mt-0.5">
                    Deep Learning Curriculum
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 py-4 px-3">
              <nav className="space-y-1.5">
                {navItems.map(({ path, label, icon: Icon, sub }) => {
                  const chapterKey = path.startsWith('/chapter') ? path.slice(1) : null
                  const isChapter = Boolean(chapterKey)
                  const isExpanded = chapterKey ? openChapter === chapterKey : false
                  const isActiveChapter = chapterKey ? currentChapter === chapterKey : false
                  const chapter = chapterKey ? chaptersData[chapterKey] : null

                  return (
                    <div key={path} className="relative">
                      {isChapter && chapter ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (currentChapter === chapterKey) {
                              setOpenChapter(openChapter === chapterKey ? null : chapterKey)
                            } else {
                              navigate(path)
                              setOpenChapter(chapterKey)
                            }
                          }}
                          className={`
                            group w-full flex items-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition-all duration-200
                            ${isActiveChapter || isExpanded
                              ? 'bg-gradient-to-r from-blue-50/90 to-blue-50/40 text-blue-700 shadow-sm ring-1 ring-blue-100'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                            }
                          `}
                        >
                          <div
                            className={`
                              p-1 rounded-lg transition-all duration-200
                              ${isActiveChapter || isExpanded
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                              }
                            `}
                          >
                            <Icon size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="font-semibold leading-tight tracking-tight">
                              {label}
                            </div>
                            {sub && (
                              <div className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-1">
                                {sub}
                              </div>
                            )}
                          </div>

                          <ChevronDown
                            size={16}
                            className={`
                              mt-1 flex-shrink-0 text-slate-400 transition-transform duration-200
                              ${isExpanded ? 'rotate-180 text-blue-500' : 'group-hover:text-slate-500'}
                            `}
                          />
                        </button>
                      ) : (
                        <NavLink
                          to={path}
                          end={path === '/'}
                          className={({ isActive }) => `
                            group flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm transition-all duration-200
                            ${isActive
                              ? 'bg-gradient-to-r from-blue-50/90 to-blue-50/40 text-blue-700 shadow-sm ring-1 ring-blue-100'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                            }
                          `}
                        >
                          {({ isActive }) => (
                            <>
                              <div
                                className={`
                                  p-1 rounded-lg transition-all duration-200
                                  ${isActive
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                                  }
                                `}
                              >
                                <Icon size={16} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="font-semibold leading-tight tracking-tight">
                                  {label}
                                </div>
                              </div>

                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                              )}
                            </>
                          )}
                        </NavLink>
                      )}

                      {isChapter && chapter && isExpanded && (
                        <div className="mt-2 ml-11 space-y-1 border-l-2 border-blue-100 pl-4 transition-all duration-200">
                          <div className="flex items-center gap-1.5 mb-2 mt-1">
                            <Sparkles size={12} className="text-blue-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {chapter.subtitle}
                            </span>
                          </div>

                          {chapter.sections.map((section) => {
                            const isActiveLab = activeLab === section.id

                            return (
                              <button
                                key={section.id}
                                onClick={() => {
                                  setSidebarOpen(false)
                                  navigate(`${path}?lab=${section.id}`)
                                }}
                                className={`
                                  w-full group flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all duration-150
                                  ${isActiveLab
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                  }
                                `}
                              >
                                <ChevronRight
                                  size={12}
                                  className={`
                                    transition-transform duration-150 flex-shrink-0
                                    ${isActiveLab
                                      ? 'text-blue-500 translate-x-0.5'
                                      : 'text-slate-300 group-hover:translate-x-0.5'
                                    }
                                  `}
                                />
                                <span>{section.name}</span>
                                {isActiveLab && (
                                  <span className="ml-auto w-1 h-1 rounded-full bg-blue-500"></span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>

            <div className="p-5 border-t border-slate-100 bg-gradient-to-t from-slate-50/50 to-white">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span>All computations run locally</span>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                No external APIs • Privacy-first
              </p>
            </div>
          </aside>
        )}

        <main className="flex-1 min-w-0 overflow-y-auto relative" style={{ paddingTop: '64px' }}>
          <div className="mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}