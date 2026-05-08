import React from 'react'
import { Github, Linkedin, Globe, Mail, Code, Zap, Award } from 'lucide-react'

export default function Developer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        
        {/* Hero Section with Photo */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur-2xl opacity-40"></div>
              <img 
                src="/1777808991916.png" 
                alt="Neelesh Ranpuriya" 
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl border-4 border-white"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Neelesh Ranpuriya
          </h1>
          <p className="text-xl text-blue-300 mb-6 font-medium">
            Full-Stack Developer & Deep Learning Enthusiast
          </p>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            Building interactive web applications and educational platforms. Passionate about deep learning, UI/UX design, and creating tools that make complex concepts accessible to everyone.
          </p>

          {/* Social Links & Portfolio Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a
              href="https://neelesh-ranpuriya.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all border border-emerald-500/50 hover:border-emerald-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Globe size={18} className="flex-shrink-0" />
              Portfolio
            </a>

            <a
              href="https://www.linkedin.com/in/neelesh-ranpuriya-0920512b2/?skipRedirect=true"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-all border border-blue-500/50 hover:border-blue-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Linkedin size={18} className="flex-shrink-0" />
              LinkedIn
            </a>

            <a
              href="https://github.com/NeeleshRanpuriya"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-500/20 text-slate-300 hover:bg-slate-500/30 transition-all border border-slate-500/50 hover:border-slate-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Github size={18} className="flex-shrink-0" />
              GitHub
            </a>

            <a
              href="mailto:neeleshranpuriya@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-all border border-red-500/50 hover:border-red-400 font-medium whitespace-nowrap text-sm backdrop-blur-sm"
            >
              <Mail size={18} className="flex-shrink-0" />
              Email
            </a>
          </div>
        </div>

        {/* Skills Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Frontend Skills */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:shadow-xl hover:shadow-blue-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Code size={20} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Frontend</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">React, TypeScript, Tailwind CSS</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">Vite, Next.js, React Router</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">HTML5, CSS3, Canvas API</span>
              </li>
            </ul>
          </div>

          {/* Backend & Tools Skills */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Zap size={20} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Backend & Tools</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">Python, FastAPI, NumPy</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">Git, Docker, PM2</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">Deep Learning, Neural Networks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* About DeepLab 3D Section */}
        <div className="bg-gradient-to-br from-blue-500/10 via-slate-800/50 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-10 border border-slate-700/50 hover:border-blue-500/50 transition-all">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Award size={24} className="text-blue-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">About DeepLab 3D</h2>
          </div>
          
          <p className="text-slate-300 leading-relaxed mb-6 text-lg">
            DeepLab 3D is an interactive educational platform built to make deep learning concepts accessible and fun. It features real neural network computations, smooth animations, and hands-on labs where you can experiment with:
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-slate-300">Perceptrons & Neural Networks with real backpropagation</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-slate-300">CNNs, RNNs, LSTMs & Transformers visualization</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-slate-300">GANs, Autoencoders & Generative Models</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
              <span className="text-slate-300">Interactive parameter tuning with real-time feedback</span>
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed">
            All computations run locally in your browser. No external APIs required. Perfect for students, educators, and anyone curious about how deep learning works under the hood.
          </p>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:scale-105"
          >
            Explore DeepLab 3D
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
