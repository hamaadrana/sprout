import { Link, usePage } from '@inertiajs/react'
import { useEffect, useRef } from 'react'
import Shell from '../components/Shell'

const SIZE = 1080

function drawCard(ctx, { childName, monthLabel, masteredThisMonth, activeDays, readiness }) {
  ctx.fillStyle = '#f8f4f4'
  ctx.fillRect(0, 0, SIZE, SIZE)

  const pad = 90
  const serif = (weight, px) => `${weight} ${px}px "Source Serif 4", Georgia, serif`
  const mono = (px) => `600 ${px}px ui-monospace, Menlo, monospace`

  ctx.fillStyle = '#006786'
  ctx.font = mono(26)
  ctx.fillText(monthLabel.toUpperCase(), pad, pad + 26)

  ctx.fillStyle = '#201e1d'
  ctx.font = serif(600, 76)
  const headline = `${childName} finished ${masteredThisMonth} skill${masteredThisMonth === 1 ? '' : 's'} this month`
  const words = headline.split(' ')
  let line = ''
  let y = pad + 140
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > SIZE - pad * 2 && line) {
      ctx.fillText(line, pad, y)
      line = word
      y += 88
    } else {
      line = test
    }
  }
  ctx.fillText(line, pad, y)

  const statsY = SIZE - 330
  ctx.font = serif(600, 92)
  ctx.fillText(String(activeDays), pad, statsY)
  ctx.fillText(`${readiness.met}/${readiness.total}`, pad + 330, statsY)
  ctx.font = serif(400, 30)
  ctx.fillStyle = '#605d5d'
  ctx.fillText('days learning', pad, statsY + 48)
  ctx.fillText('readiness outcomes', pad + 330, statsY + 48)

  ctx.font = serif(400, 28)
  ctx.fillStyle = '#7d7979'
  ctx.fillText('Mapped to the national ECE curriculum', pad, SIZE - pad)
  ctx.fillStyle = '#201e1d'
  ctx.font = serif(600, 36)
  const brand = 'Tracker'
  ctx.fillText(brand, SIZE - pad - ctx.measureText(brand).width, SIZE - pad)

  ctx.strokeStyle = '#0088b0'
  ctx.lineWidth = 10
  ctx.strokeRect(5, 5, SIZE - 10, SIZE - 10)
}

export default function ShareCard(props) {
  const { child } = usePage().props
  const canvasRef = useRef(null)

  const paint = () => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    drawCard(ctx, {
      childName: child?.name || '',
      monthLabel: props.month_label,
      masteredThisMonth: props.mastered_this_month,
      activeDays: props.consistency.active_days,
      readiness: props.readiness,
    })
  }

  useEffect(() => {
    paint()
    if (document.fonts?.ready) document.fonts.ready.then(paint)
  }, [])

  const save = () => {
    canvasRef.current.toBlob((blob) => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `tracker-${props.month}.png`
      a.click()
      URL.revokeObjectURL(a.href)
    }, 'image/png')
  }

  return (
    <Shell active="Report">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div className="n">Shareable card · {props.month_label}</div>
        <h1 style={{ fontSize: 30, margin: 'var(--space-2) 0 var(--space-4)' }}>
          Built to be forwarded
        </h1>
        <div style={{ background: 'var(--color-neutral-200)', padding: 'var(--space-4)' }}>
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            style={{ width: '100%', height: 'auto', display: 'block', boxShadow: 'var(--shadow-md)' }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <button className="btn btn-primary" onClick={save}>Save image</button>
            <Link href={`/report?month=${props.month}`} className="btn btn-ghost">Back to the report</Link>
          </div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginTop: 'var(--space-3)' }}>
          Saves as a square image — drop it straight into the family group.
        </p>
      </div>
    </Shell>
  )
}
