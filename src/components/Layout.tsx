import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Brain, Menu, X, ChevronRight, Layers, Network, Cpu, GitBranch, Zap, Home } from 'lucide-react'

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/unit1', label: 'Unit I – Foundations', icon: Network, sub: 'Perceptron · Activations · Optimizers' },
  { path: '/unit2', label: 'Unit II – Deep Networks', icon: Layers, sub: 'Width · Depth · RBM · Autoencoder' },
  { path: '/unit3', label: 'Unit III – CNN', icon: Cpu, sub: 'AlexNet · ResNet · DenseNet · PixelNet' },
  { path: '/unit4', label: 'Unit IV – RNN', icon: GitBranch, sub: 'LSTM · Seq2Seq · BPTT · Bidirectional' },
  { path: '/unit5', label: 'Unit V – Generative', icon: Zap, sub: 'Autoencoder · GAN · DBN · Boltzmann' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">DeepLab 3D</span>
            <span className="hidden sm:block text-xs text-slate-400 border-l border-slate-200 pl-2 ml-1">
              Interactive Deep Learning Visualizer
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:block text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-3 py-1 font-medium">
              v1.0 – Educational
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col pt-14 lg:pt-0 overflow-y-auto
          `}
        >
          <div className="p-3 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-2">
              Syllabus
            </p>
            <nav className="space-y-0.5">
              {navItems.map(({ path, label, icon: Icon, sub }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium leading-tight">{label}</div>
                        {sub && (
                          <div className="text-xs text-slate-400 mt-0.5 leading-tight">{sub}</div>
                        )}
                      </div>
                      {isActive && <ChevronRight size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">
              All computations run locally.<br />No external APIs used.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
