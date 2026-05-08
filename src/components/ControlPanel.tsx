import React from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  unit?: string
}

export function Slider({ label, value, min, max, step = 1, onChange, unit = '' }: SliderProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
          {typeof value === 'number' && step < 1 ? value.toFixed(4) : value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-blue-500 cursor-pointer"
      />
    </div>
  )
}

interface SelectProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}

export function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="mb-3">
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 appearance-none pr-8"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

interface PanelProps {
  title: string
  children: React.ReactNode
}

export function ControlSection({ title, children }: PanelProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">{title}</h3>
      {children}
    </div>
  )
}

interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
}

export function Button({ onClick, children, variant = 'primary', disabled, className = '' }: ButtonProps) {
  const styles = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

interface InfoBoxProps {
  label: string
  value: string | number
  color?: string
}

export function InfoBadge({ label, value, color = 'blue' }: InfoBoxProps) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    green: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    orange: 'bg-orange-50 border-orange-100 text-orange-700',
    red: 'bg-red-50 border-red-100 text-red-700',
    violet: 'bg-violet-50 border-violet-100 text-violet-700',
  }
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm mb-2 ${colors[color]}`}>
      <span className="font-medium text-xs">{label}</span>
      <span className="font-mono font-semibold text-sm">{value}</span>
    </div>
  )
}

export function ExplanationBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
      {children}
    </div>
  )
}
