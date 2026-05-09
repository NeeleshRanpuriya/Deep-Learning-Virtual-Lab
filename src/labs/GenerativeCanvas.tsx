import React, { useRef, useEffect } from 'react'

type GenMode = 'autoencoder' | 'gan' | 'boltzmann' | 'dbn' | 'dbm'

interface GenerativeCanvasProps {
  mode: GenMode
  animating: boolean
  epoch?: number
}

export default function GenerativeCanvas({ mode, animating, epoch = 0 }: GenerativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height

    function drawArrow(x1: number, y1: number, x2: number, y2: number, color: string, lw = 1.5, dash = false) {
      ctx.setLineDash(dash ? [5, 3] : [])
      const angle = Math.atan2(y2 - y1, x2 - x1)
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.stroke()
      ctx.setLineDash([])
      ctx.save(); ctx.translate(x2, y2); ctx.rotate(angle)
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-8, -4); ctx.lineTo(-8, 4); ctx.closePath()
      ctx.fillStyle = color; ctx.fill(); ctx.restore()
    }

    function drawBox(x: number, y: number, w: number, h: number, label: string, color: string, border: string, active = false, sublabel = '') {
      if (active) { ctx.shadowColor = border; ctx.shadowBlur = 16 }
      ctx.beginPath()
      ctx.roundRect(x, y, w, h, 8)
      ctx.fillStyle = active ? color.replace('1e', '2a') : color; ctx.fill()
      ctx.strokeStyle = border; ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke()
      ctx.shadowBlur = 0
      const lines = label.split('\n')
      lines.forEach((l, li) => {
        ctx.fillStyle = active ? '#e2e8f0' : '#94a3b8'
        ctx.font = `${lines.length > 2 ? 9 : 10}px monospace`; ctx.textAlign = 'center'
        ctx.fillText(l, x + w / 2, y + h / 2 - (lines.length - 1) * 6 + li * 12)
      })
      if (sublabel) {
        ctx.fillStyle = border; ctx.font = '8px monospace'
        ctx.fillText(sublabel, x + w / 2, y + h - 6)
      }
    }

    function drawNeurons(cx: number, cy: number, n: number, r = 10, color = '#1e293b', border = '#334155', active = false) {
      const spacing = Math.min(28, (H * 0.6) / Math.max(n - 1, 1))
      const startY = cy - (n - 1) * spacing / 2
      for (let i = 0; i < n; i++) {
        const ny = startY + i * spacing
        ctx.beginPath(); ctx.arc(cx, ny, r, 0, Math.PI * 2)
        ctx.fillStyle = active ? lighten(color) : color; ctx.fill()
        ctx.strokeStyle = active ? lighten(border) : border; ctx.lineWidth = active ? 2 : 1.5; ctx.stroke()
        if (active) { ctx.shadowColor = border; ctx.shadowBlur = 8; ctx.stroke(); ctx.shadowBlur = 0 }
        // Small activation value dot
        const v = Math.sin(tRef.current * 2 + i) * 0.5 + 0.5
        ctx.beginPath(); ctx.arc(cx, ny, r * v * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = active ? border : '#1e3a5f'; ctx.fill()
      }
      return { startY, spacing, n }
    }

    function connectLayers(
      x1: number, y1Start: number, n1: number, s1: number,
      x2: number, y2Start: number, n2: number, s2: number,
      color: string, opacity: number
    ) {
      for (let i = 0; i < n1; i++) {
        for (let j = 0; j < n2; j++) {
          const strength = Math.sin(tRef.current + i * 0.5 + j * 0.3) * 0.5 + 0.5
          ctx.beginPath()
          ctx.moveTo(x1, y1Start + i * s1); ctx.lineTo(x2, y2Start + j * s2)
          ctx.strokeStyle = color.replace(')', `,${opacity * 0.3 + strength * opacity * 0.2})`)
          ctx.lineWidth = 0.5 + strength * 0.8; ctx.stroke()
        }
      }
    }

    function lighten(hex: string): string {
      return hex.replace(/\d{2}/g, m => Math.min(255, parseInt(m, 16) + 40).toString(16).padStart(2, '0'))
    }

    function drawAutoencoder() {
      const phase = animating ? tRef.current * 0.5 % 3 : 0 // 0=encode, 1=latent, 2=decode
      const isEnc = phase < 1, isLat = phase >= 1 && phase < 2, isDec = phase >= 2

      const bW = 80, bH = 120, bY = (H - bH) / 2

      // Input box
      const inputX = 20
      drawBox(inputX, bY, bW, bH, 'Input\nData\n(x)', '#0f2744', '#3b82f6', isEnc && animating)

      // Encoder
      const encX = inputX + bW + 40
      drawBox(encX, bY + 20, 70, bH - 40, 'Encoder\nf(x)', '#1e293b', '#818cf8', isEnc && animating, 'compress')
      drawArrow(inputX + bW, H / 2, encX, H / 2, isEnc && animating ? '#3b82f6' : '#334155', 2)

      // Latent space
      const latX = encX + 70 + 40
      const latH = 60
      const latY = (H - latH) / 2
      drawBox(latX, latY, 56, latH, 'Latent\nz', '#1a1060', '#a78bfa', isLat && animating, `dim=${Math.round(3 + epoch * 0.5)}`)
      drawArrow(encX + 70, H / 2, latX, H / 2, isLat && animating ? '#818cf8' : '#334155', 2)

      // Signal particles along encode path
      if (animating && isEnc) {
        const prog = phase
        const px = inputX + bW + (encX - inputX - bW) * prog
        ctx.beginPath(); ctx.arc(px, H / 2, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#3b82f6'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0
      }
      if (animating && isLat) {
        const prog = phase - 1
        const px = encX + 70 + (latX - encX - 70) * prog
        ctx.beginPath(); ctx.arc(px, H / 2, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#a78bfa'; ctx.shadowColor = '#818cf8'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0
      }

      // Decoder
      const decX = latX + 56 + 40
      drawBox(decX, bY + 20, 70, bH - 40, 'Decoder\ng(z)', '#1e293b', '#f97316', isDec && animating, 'reconstruct')
      drawArrow(latX + 56, H / 2, decX, H / 2, isDec && animating ? '#a78bfa' : '#334155', 2)

      // Output box
      const outX = decX + 70 + 40
      drawBox(outX, bY, bW, bH, 'Recon.\nOutput\n(x̂)', '#0f2214', '#10b981', isDec && animating)
      drawArrow(decX + 70, H / 2, outX, H / 2, isDec && animating ? '#f97316' : '#334155', 2)
      if (animating && isDec) {
        const prog = phase - 2
        const px = decX + 70 + (outX - decX - 70) * prog
        ctx.beginPath(); ctx.arc(px, H / 2, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#34d399'; ctx.shadowColor = '#10b981'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0
      }

      // Loss
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Reconstruction Loss: ||x - x̂||²', W / 2, H - 10)
    }

    function drawGAN() {
      const phase = animating ? tRef.current * 0.4 % 4 : 0
      // 0: noise→gen, 1: gen→fake, 2: disc compare, 3: update

      const bH = 80, bY = (H - bH) / 2
      const noiseX = 10, genX = 100, fakeX = 210, discX = 340, realX = 500

      // Noise
      drawBox(noiseX, bY, 70, bH, 'Noise\nz~N(0,1)', '#1e293b', '#6366f1', phase < 1 && animating)
      // Generator
      drawBox(genX, bY - 10, 80, bH + 20, 'Generator\nG(z)', '#1e1040', '#818cf8', phase < 2 && animating, 'θ_G')
      drawArrow(noiseX + 70, H / 2, genX, H / 2, phase < 1 && animating ? '#6366f1' : '#334155', 2)
      if (animating && phase < 1) {
        const prog = phase; const px = noiseX + 70 + (genX - noiseX - 70) * prog
        ctx.beginPath(); ctx.arc(px, H / 2, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#818cf8'; ctx.shadowColor = '#6366f1'; ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0
      }

      // Fake data
      drawBox(fakeX, bY, 80, bH, 'Fake\nData\nG(z)', '#1a1330', '#a78bfa', phase >= 1 && phase < 2 && animating)
      drawArrow(genX + 80, H / 2, fakeX, H / 2, phase >= 1 && animating ? '#818cf8' : '#334155', 2)

      // Real data (from top)
      drawBox(realX, bY - 40, 70, bH, 'Real\nData\nx~p(x)', '#0f2a14', '#10b981', false)
      drawArrow(realX + 35, bY + bH - 40, discX + 40, bY - 10, '#10b981', 1.5)

      // Discriminator
      drawBox(discX, bY - 10, 80, bH + 20, 'Discriminator\nD(x)', '#1a0f10', '#ef4444', phase >= 2 && animating, 'θ_D')
      drawArrow(fakeX + 80, H / 2, discX, H / 2, phase >= 2 && animating ? '#a78bfa' : '#334155', 2)

      // Output
      const outX = discX + 80 + 20
      const outActive = phase >= 3 && animating
      const outLabel = outActive ? (epoch % 2 === 0 ? 'FAKE\n0.12' : 'REAL\n0.87') : 'Real/Fake\nScore'
      drawBox(outX, bY + 10, 60, bH - 20, outLabel, outActive ? (epoch % 2 === 0 ? '#2a0505' : '#0a2a10') : '#1e293b', outActive ? (epoch % 2 === 0 ? '#ef4444' : '#10b981') : '#334155', outActive)
      drawArrow(discX + 80, H / 2, outX, H / 2, phase >= 3 && animating ? '#ef4444' : '#334155', 2)

      // Gradient back to G (dashed)
      if (phase >= 3 && animating) {
        drawArrow(discX, H / 2 + 30, genX + 40, H / 2 + 30, '#f97316', 1.5, true)
        ctx.fillStyle = '#f97316'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
        ctx.fillText('∇ Update G', (discX + genX) / 2, H / 2 + 48)
      }

      // Labels
      ctx.fillStyle = '#475569'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
      const phaseLabels = ['Sampling noise...', 'Generator forward pass...', 'Discriminator comparing...', 'Updating weights...']
      ctx.fillText(phaseLabels[Math.min(Math.floor(phase), 3)], W / 2, H - 8)
    }

    function drawBoltzmann() {
      const visibleN = 5, hiddenN = 4
      const visX = 100, hidX = W - 100
      const visSpacing = 36, hidSpacing = 40
      const visStartY = H / 2 - (visibleN - 1) * visSpacing / 2
      const hidStartY = H / 2 - (hiddenN - 1) * hidSpacing / 2

      // Title & type
      ctx.fillStyle = '#475569'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'
      if (mode === 'boltzmann') ctx.fillText('Restricted Boltzmann Machine (RBM)', W / 2, 16)
      if (mode === 'dbn') ctx.fillText('Deep Belief Network (DBN)', W / 2, 16)
      if (mode === 'dbm') ctx.fillText('Deep Boltzmann Machine (DBM)', W / 2, 16)

      // For DBN/DBM, add extra layers
      const extraLayers = mode === 'dbn' ? 2 : mode === 'dbm' ? 1 : 0
      const layerXs = mode === 'boltzmann' ? [visX, hidX] :
        mode === 'dbn' ? [60, 200, 340, W - 60] :
        [60, 200, 340, W - 60]

      layerXs.forEach((lx, li) => {
        const nCount = li === 0 ? visibleN : li === layerXs.length - 1 ? 3 : hiddenN - 1
        const spacing = 36
        const startY = H / 2 - (nCount - 1) * spacing / 2
        const label = li === 0 ? 'Visible\nLayer' : li === layerXs.length - 1 ? 'Top\nLayer' : `Hidden\nLayer ${li}`
        const color = li === 0 ? '#1e3a5f' : '#1e293b'
        const border = li === 0 ? '#3b82f6' : li === layerXs.length - 1 ? '#10b981' : '#818cf8'
        const active = animating && Math.floor(tRef.current * 0.5) % layerXs.length === li

        // Connections to next layer
        if (li < layerXs.length - 1) {
          const nextN = li + 1 === layerXs.length - 1 ? 3 : hiddenN - 1
          const nextSpacing = 36
          const nextStartY = H / 2 - (nextN - 1) * nextSpacing / 2
          const nextLx = layerXs[li + 1]
          for (let i = 0; i < nCount; i++) {
            for (let j = 0; j < nextN; j++) {
              const w = Math.sin(i * 1.3 + j * 0.7 + tRef.current) * 0.5 + 0.5
              ctx.beginPath()
              ctx.moveTo(lx, startY + i * spacing)
              ctx.lineTo(nextLx, nextStartY + j * nextSpacing)
              ctx.strokeStyle = active ? `rgba(129,140,248,${0.2 + w * 0.3})` : `rgba(71,85,105,${0.1 + w * 0.15})`
              ctx.lineWidth = w * 1.5; ctx.stroke()
            }
          }
          // DBM: also bidirectional
          if (mode === 'dbm' && li > 0) {
            ctx.fillStyle = '#475569'; ctx.font = '8px monospace'; ctx.textAlign = 'center'
            ctx.fillText('⇅', (lx + nextLx) / 2, H / 2 - nCount * spacing / 2 - 14)
          }
        }

        // Neurons
        for (let i = 0; i < nCount; i++) {
          const ny = startY + i * spacing
          const actV = Math.max(0, Math.sin(tRef.current * 1.5 + i * 0.8 + li * 0.4))
          ctx.beginPath(); ctx.arc(lx, ny, 14, 0, Math.PI * 2)
          ctx.fillStyle = active ? `rgba(${li === 0 ? '30,58,95' : '30,41,59'}, 0.9)` : color; ctx.fill()
          ctx.strokeStyle = active ? border : '#334155'; ctx.lineWidth = active ? 2.5 : 1.5; ctx.stroke()
          if (active) { ctx.shadowColor = border; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0 }
          ctx.beginPath(); ctx.arc(lx, ny, 7 * actV, 0, Math.PI * 2)
          ctx.fillStyle = border; ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1
        }

        ctx.fillStyle = '#64748b'; ctx.font = '9px monospace'; ctx.textAlign = 'center'
        label.split('\n').forEach((l, li2) => ctx.fillText(l, lx, H / 2 + (nCount - 1) * spacing / 2 + 18 + li2 * 11))
      })
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H)
      if (animating) tRef.current += 0.016

      switch (mode) {
        case 'autoencoder': drawAutoencoder(); break
        case 'gan': drawGAN(); break
        case 'boltzmann':
        case 'dbn':
        case 'dbm':
          drawBoltzmann(); break
      }
    }

    function loop() { draw(); rafRef.current = requestAnimationFrame(loop) }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [mode, animating, epoch])

  return (
    <canvas ref={canvasRef} width={680} height={260} className="w-full rounded-lg"
      style={{ imageRendering: 'crisp-edges', backgroundColor: '#000' }} />
  )
}
