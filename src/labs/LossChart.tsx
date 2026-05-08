import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface LossChartProps {
  data: { epoch: number; loss: number; valLoss?: number; acc?: number }[]
  title?: string
  height?: number
}

export default function LossChart({ data, title = 'Training Progress', height = 180 }: LossChartProps) {
  return (
    <div className="bg-slate-900 rounded-xl p-3">
      <p className="text-xs text-slate-400 font-medium mb-2">{title}</p>
      {data.length === 0 ? (
        <div className="flex items-center justify-center text-slate-600 text-xs" style={{ height }}>
          Training not started
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="epoch"
              tick={{ fill: '#64748b', fontSize: 10 }}
              label={{ value: 'Epoch', position: 'insideBottomRight', offset: -5, fill: '#475569', fontSize: 10 }}
            />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} width={40} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
            <Line
              type="monotone" dataKey="loss" name="Train Loss"
              stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }}
            />
            {data[0]?.valLoss !== undefined && (
              <Line
                type="monotone" dataKey="valLoss" name="Val Loss"
                stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 2"
              />
            )}
            {data[0]?.acc !== undefined && (
              <Line
                type="monotone" dataKey="acc" name="Accuracy"
                stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="6 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
