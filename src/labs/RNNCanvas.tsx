import React, { useRef, useEffect } from 'react'

type RNNMode = 'rnn' | 'birnn' | 'seq2seq' | 'bptt' | 'lstm'

interface RNNCanvasProps {
  mode: RNNMode
  steps: number
  animating: boolean
  lstmGates?: { forget: number; input: number; cell: number; output: number }
}

export default function RNNCanvas({ mode, steps, animating, lstmGates }: RNNCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    const CELL_R = 26
    const HIDDEN_R = 22

    function drawRoundRect(x: number, y: number, w: number, h: number, r: number, fill: string, stroke: string, lw = 1.5) {
      ctx.beginPath()
      ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fillStyle = fill; ctx.fill()
      ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke()
    }

    function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, lw = 1.5) {
      const angle = Math.atan2(y2 - y1, x2 - x1)
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
      ctx.save(); ctx.translate(x2, y2); ctx.rotate(angle)
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, -4); ctx.lineTo(-8, 4); ctx.closePath()
      ctx.fillStyle = color; ctx.fill(); ctx.restore()
    }

    function drawLabel(text: string, x: number, y: number, color = '#94a3b8', size = 10) {
      ctx.fillStyle = color; ctx.font = `${size}px monospace`; ctx.textAlign = 'center'
      text.split('\n').forEach((line, i) => ctx.fillText(line, x, y + i * 12))
    }

    function drawRNN() {
      const n = Math.min(steps, 6)
      const xStep = (W - 60) / Math.max(n, 1)
      const cellY = H / 2 - 20
      const inputY = H - 50
      const outputY = 40

      for (let i = 0; i < n; i++) {
        const cx = 40 + i * xStep
        const activeStep = animating ? Math.floor(tRef.current * n * 0.4) % (n + 1) : -1
        const isActive = i <= activeStep

        // Hidden state arrow →
        if (i > 0) {
          const prevCx = 40 + (i - 1) * xStep
          drawArrow(prevCx + CELL_R + 10, cellY, cx - CELL_R - 10, cellY, isActive ? '#3b82f6' : '#334155', isActive ? 2.5 : 1.5)
          // Signal dot
          if (animating && activeStep === i) {
            const prog = (tRef.current * n * 0.4) % 1
            const dx = prevCx + CELL_R + 10 + (cx - CELL_R - 10 - prevCx - CELL_R - 10) * prog
            ctx.beginPath(); ctx.arc(dx, cellY, 5, 0, Math.PI * 2)
            ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#60a5fa'; ctx.shadowBlur = 10
            ctx.fill(); ctx.shadowBlur = 0
          }
        }

        // RNN cell
        if (isActive && animating) { ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 14 }
        ctx.beginPath(); ctx.arc(cx, cellY, CELL_R, 0, Math.PI * 2)
        ctx.fillStyle = isActive ? '#1e3a5f' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = isActive ? '#3b82f6' : '#334155'; ctx.lineWidth = 2; ctx.stroke()
        ctx.shadowBlur = 0
        drawLabel('RNN', cx, cellY + 4, '#94a3b8', 9)

        // Input arrow ↑
        drawArrow(cx, inputY - 10, cx, cellY + CELL_R + 8, isActive ? '#10b981' : '#334155', 1.5)
        drawLabel(`x${i+1}`, cx, inputY + 6, '#64748b', 9)

        // Output arrow ↑
        drawArrow(cx, cellY - CELL_R - 8, cx, outputY + 14, isActive ? '#f97316' : '#334155', 1.5)
        drawLabel(`h${i+1}`, cx, outputY - 4, '#64748b', 9)
      }

      // h0 arrow
      drawArrow(10, cellY, 40 - CELL_R - 10, cellY, '#475569')
      drawLabel('h0', 18, cellY - 14, '#475569', 9)
    }

    function drawBiRNN() {
      const n = Math.min(steps, 5)
      const xStep = (W - 60) / Math.max(n, 1)
      const fwdY = H / 2 - 30
      const bwdY = H / 2 + 40
      const inputY = H - 45
      const prog = animating ? (tRef.current * n * 0.4) % (n + 1) : -1

      for (let i = 0; i < n; i++) {
        const cx = 40 + i * xStep
        const fwdActive = i <= prog
        const bwdActive = (n - 1 - i) <= prog

        // Forward cell
        if (i > 0) {
          drawArrow(40 + (i - 1) * xStep + HIDDEN_R + 6, fwdY, cx - HIDDEN_R - 6, fwdY, fwdActive ? '#3b82f6' : '#334155', 2)
        }
        ctx.beginPath(); ctx.arc(cx, fwdY, HIDDEN_R, 0, Math.PI * 2)
        ctx.fillStyle = fwdActive && animating ? '#1e3a5f' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = fwdActive && animating ? '#3b82f6' : '#334155'; ctx.lineWidth = 1.5; ctx.stroke()
        drawLabel('→', cx, fwdY + 5, '#3b82f6', 14)

        // Backward cell
        if (i < n - 1) {
          drawArrow(40 + (i + 1) * xStep - HIDDEN_R - 6, bwdY, cx + HIDDEN_R + 6, bwdY, bwdActive ? '#f97316' : '#334155', 2)
        }
        ctx.beginPath(); ctx.arc(cx, bwdY, HIDDEN_R, 0, Math.PI * 2)
        ctx.fillStyle = bwdActive && animating ? '#431407' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = bwdActive && animating ? '#f97316' : '#334155'; ctx.lineWidth = 1.5; ctx.stroke()
        drawLabel('←', cx, bwdY + 5, '#f97316', 14)

        // Input
        drawArrow(cx, inputY - 8, cx, bwdY + HIDDEN_R + 6, '#10b981', 1.5)
        drawLabel(`x${i+1}`, cx, inputY + 4, '#64748b', 9)

        // Output (concat)
        drawArrow(cx, fwdY - HIDDEN_R - 6, cx, 22, '#a78bfa', 1.5)
        drawLabel(`y${i+1}`, cx, 14, '#64748b', 9)
      }
      drawLabel('→ Forward', W / 2, H - 8, '#3b82f6', 9)
      drawLabel('← Backward', W / 2, H - 8 + 14, '#f97316', 9)
    }

    function drawSeq2Seq() {
      const encSteps = 3, decSteps = 3
      const cellY = H / 2
      const xStep = 80
      const encStartX = 40
      const decStartX = encStartX + encSteps * xStep + 70
      const prog = animating ? tRef.current * 0.4 % (encSteps + decSteps + 1) : -1

      // Encoder
      drawLabel('ENCODER', encStartX + (encSteps - 0.5) * xStep / 2, 18, '#94a3b8', 10)
      for (let i = 0; i < encSteps; i++) {
        const cx = encStartX + i * xStep + 30
        const active = i <= prog
        if (i > 0) drawArrow(encStartX + (i-1)*xStep + 30 + HIDDEN_R + 4, cellY, cx - HIDDEN_R - 4, cellY, active ? '#3b82f6' : '#334155', 2)
        ctx.beginPath(); ctx.arc(cx, cellY, HIDDEN_R, 0, Math.PI * 2)
        ctx.fillStyle = active && animating ? '#1e3a5f' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = active && animating ? '#3b82f6' : '#334155'; ctx.lineWidth = 2; ctx.stroke()
        drawLabel('Enc', cx, cellY + 4, '#60a5fa', 9)
        drawArrow(cx, H - 45, cx, cellY + HIDDEN_R + 6, '#10b981', 1.5)
        drawLabel(`x${i+1}`, cx, H - 35, '#64748b', 9)
      }

      // Context vector
      const ctxX = encStartX + encSteps * xStep + 20
      drawRoundRect(ctxX - 18, cellY - 18, 36, 36, 6, prog >= encSteps && animating ? '#312e81' : '#1e293b', prog >= encSteps && animating ? '#818cf8' : '#334155', 2)
      drawLabel('CTX', ctxX, cellY + 4, '#a78bfa', 9)
      drawArrow(encStartX + (encSteps - 1) * xStep + 30 + HIDDEN_R + 4, cellY, ctxX - 18, cellY, prog >= encSteps && animating ? '#818cf8' : '#334155', 2)

      // Decoder
      drawLabel('DECODER', decStartX + (decSteps - 0.5) * xStep / 2, 18, '#94a3b8', 10)
      drawArrow(ctxX + 18, cellY, decStartX - 10, cellY, prog > encSteps && animating ? '#818cf8' : '#334155', 2)
      for (let i = 0; i < decSteps; i++) {
        const cx = decStartX + i * xStep
        const active = (encSteps + i) <= prog
        if (i > 0) drawArrow(decStartX + (i-1)*xStep + HIDDEN_R + 4, cellY, cx - HIDDEN_R - 4, cellY, active ? '#f97316' : '#334155', 2)
        ctx.beginPath(); ctx.arc(cx, cellY, HIDDEN_R, 0, Math.PI * 2)
        ctx.fillStyle = active && animating ? '#431407' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = active && animating ? '#f97316' : '#334155'; ctx.lineWidth = 2; ctx.stroke()
        drawLabel('Dec', cx, cellY + 4, '#fb923c', 9)
        drawArrow(cx, cellY - HIDDEN_R - 6, cx, 30, active ? '#f97316' : '#334155', 1.5)
        drawLabel(`y${i+1}`, cx, 20, '#64748b', 9)
      }
    }

    function drawBPTT() {
      const n = Math.min(steps, 5)
      const xStep = (W - 60) / Math.max(n, 1)
      const cellY = H / 2
      const prog = animating ? (tRef.current * n * 0.4) % (n * 2 + 1) : -1
      const isFwd = prog <= n
      const bwdStep = isFwd ? -1 : n - (prog - n)

      for (let i = 0; i < n; i++) {
        const cx = 40 + i * xStep
        const fwdActive = isFwd && i <= prog
        const bwdActive = !isFwd && i >= bwdStep

        if (i > 0) {
          // Forward arrow
          drawArrow(40 + (i-1)*xStep + CELL_R + 6, cellY - 8, cx - CELL_R - 6, cellY - 8,
            fwdActive ? '#3b82f6' : '#334155', fwdActive ? 2 : 1)
          // Backward gradient arrow
          drawArrow(cx - CELL_R - 6, cellY + 8, 40 + (i-1)*xStep + CELL_R + 6, cellY + 8,
            bwdActive ? '#f97316' : '#1e293b', bwdActive ? 2 : 0.5)
        }

        ctx.beginPath(); ctx.arc(cx, cellY, CELL_R, 0, Math.PI * 2)
        ctx.fillStyle = (fwdActive || bwdActive) && animating ? '#1e3a5f' : '#1e293b'; ctx.fill()
        ctx.strokeStyle = fwdActive && animating ? '#3b82f6' : bwdActive && animating ? '#f97316' : '#334155'
        ctx.lineWidth = 2; ctx.stroke()
        drawLabel(`t=${i+1}`, cx, cellY + 4, '#94a3b8', 9)
      }

      drawLabel(isFwd ? '→ Forward Pass' : '← Gradient Flow (BPTT)', W / 2, H - 10, isFwd ? '#3b82f6' : '#f97316', 10)
      drawLabel('Forward ─────', W / 2, H - 24, '#334155', 8)
      drawLabel('Backward ─ ─', W / 2, H - 12, '#f97316', 8)
    }

    function drawLSTM() {
      const cX = W / 2, cY = H / 2
      const bW = 80, bH = 36, gap = 14

      const gates = lstmGates || { forget: 0.7, input: 0.5, cell: 0.3, output: 0.8 }
      const gateColors = ['#ef4444', '#3b82f6', '#10b981', '#f97316']
      const gateNames = ['Forget\nGate (f)', 'Input\nGate (i)', 'Cell\nUpdate (g)', 'Output\nGate (o)']
      const gateVals = [gates.forget, gates.input, gates.cell, gates.output]
      const totalW = 4 * bW + 3 * gap
      const startX = cX - totalW / 2

      // Cell state line
      const cellStateY = cY - 60
      ctx.beginPath(); ctx.moveTo(30, cellStateY); ctx.lineTo(W - 30, cellStateY)
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.setLineDash([6, 3]); ctx.stroke()
      ctx.setLineDash([])
      drawLabel('Cell State  Ct', 80, cellStateY - 8, '#64748b', 9)

      gateNames.forEach((name, gi) => {
        const gx = startX + gi * (bW + gap)
        const gy = cY - bH / 2
        const val = gateVals[gi]
        const alpha = 0.3 + val * 0.7
        const isActive = animating && Math.floor(tRef.current * 2) % 4 === gi

        drawRoundRect(gx, gy, bW, bH, 8,
          isActive ? `${gateColors[gi]}33` : '#1e293b',
          isActive ? gateColors[gi] : '#334155',
          isActive ? 2.5 : 1.5
        )
        if (isActive && animating) { ctx.shadowColor = gateColors[gi]; ctx.shadowBlur = 16 }
        ctx.fillStyle = gateColors[gi]
        ctx.fillRect(gx + 4, gy + bH - 6, (bW - 8) * val, 4)
        ctx.shadowBlur = 0

        const lines = name.split('\n')
        lines.forEach((line, li) => {
          ctx.fillStyle = isActive ? '#e2e8f0' : '#94a3b8'
          ctx.font = '9px monospace'; ctx.textAlign = 'center'
          ctx.fillText(line, gx + bW / 2, gy + 10 + li * 11)
        })
        ctx.fillStyle = gateColors[gi]; ctx.font = 'bold 11px monospace'
        ctx.fillText(val.toFixed(2), gx + bW / 2, gy + bH - 10)

        // Arrow up to cell state
        drawArrow(gx + bW / 2, gy - 8, gx + bW / 2, cellStateY + 4, isActive ? gateColors[gi] : '#334155', isActive ? 2 : 1)

        // Input from below
        drawArrow(gx + bW / 2, cY + 50, gx + bW / 2, gy + bH + 6, '#475569', 1)
      })

      // ht output
      drawArrow(cX, cellStateY, cX, cellStateY - 24, '#f97316', 2)
      drawLabel('ht (output)', cX, cellStateY - 30, '#f97316', 9)

      // Input/hidden labels
      drawLabel('xt (input)', cX - 100, cY + 66, '#10b981', 9)
      drawLabel('ht-1 (prev)', cX + 80, cY + 66, '#3b82f6', 9)
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.016

      switch (mode) {
        case 'rnn': drawRNN(); break
        case 'birnn': drawBiRNN(); break
        case 'seq2seq': drawSeq2Seq(); break
        case 'bptt': drawBPTT(); break
        case 'lstm': drawLSTM(); break
      }

      ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left'
      const modeLabels: Record<RNNMode, string> = {
        rnn: 'RNN – Unrolled Through Time',
        birnn: 'Bidirectional RNN',
        seq2seq: 'Seq2Seq: Encoder → Context → Decoder',
        bptt: 'BPTT – Backpropagation Through Time',
        lstm: 'LSTM – Gate Mechanics',
      }
      ctx.fillStyle = '#475569'
      ctx.fillText(modeLabels[mode], 10, 14)
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode, steps, animating, lstmGates])

  return (
    <canvas ref={canvasRef} width={680} height={280} className="w-full rounded-lg"
      style={{ imageRendering: 'crisp-edges', backgroundColor: '#000' }} />
  )
}
