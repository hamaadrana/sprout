import { Link } from '@inertiajs/react'
import { useMemo, useRef, useState } from 'react'
import Shell from '../../components/Shell'

export default function Studio({ sheet, skill, template, defaults, overridable }) {
  const frameRef = useRef(null)
  const [variant, setVariant] = useState(0)
  const [numerals, setNumerals] = useState((defaults.numerals || []).join(','))
  const [letters, setLetters] = useState((defaults.letters || []).join(','))
  const [words, setWords] = useState((defaults.words || []).join(','))
  const [repetitions, setRepetitions] = useState(defaults.repetitions || 4)
  const [guide, setGuide] = useState('dashed')

  const sheetUrl = useMemo(() => {
    const params = new URLSearchParams({ bare: '1', variant: String(variant) })
    if (overridable.includes('numerals') && numerals.trim()) params.set('numerals', numerals)
    if (overridable.includes('letters') && letters.trim()) params.set('letters', letters)
    if (overridable.includes('words') && words.trim()) params.set('words', words)
    if (overridable.includes('repetitions')) params.set('repetitions', String(repetitions))
    if (overridable.includes('guide_style')) params.set('guide_style', guide)
    return `/worksheets/${sheet.id}/sheet?${params.toString()}`
  }, [sheet.id, variant, numerals, letters, words, repetitions, guide, overridable])

  const print = () => frameRef.current?.contentWindow?.print()

  return (
    <Shell active="Worksheets">
      <div className="n">The printing press 🖨️ · {template.replace(/_/g, ' ')}</div>
      <h1 style={{ fontSize: 30, margin: 'var(--space-2) 0 var(--space-4)' }}>{sheet.title}</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 'var(--space-8)', alignItems: 'start' }}>
        <iframe
          ref={frameRef}
          src={sheetUrl}
          title="Worksheet preview"
          style={{
            width: '100%', aspectRatio: '1 / 1.414', border: 'none',
            background: '#fff', boxShadow: 'var(--shadow-sm)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {overridable.includes('numerals') && (
            <div className="field">
              <label>Numerals (comma-separated)</label>
              <input className="input" value={numerals} onChange={(e) => setNumerals(e.target.value)} />
            </div>
          )}
          {overridable.includes('words') && (
            <div className="field">
              <label>Words (comma-separated)</label>
              <input className="input" value={words} onChange={(e) => setWords(e.target.value)} placeholder="cat, sun, mat" />
            </div>
          )}
          {overridable.includes('letters') && (
            <div className="field">
              <label>Letters (comma-separated)</label>
              <input className="input" value={letters} onChange={(e) => setLetters(e.target.value)} />
            </div>
          )}
          {overridable.includes('repetitions') && (
            <div className="field">
              <label>Repetitions per row</label>
              <div className="seg">
                {[ 4, 6, 8 ].map((n) => (
                  <label key={n} className="seg-opt">
                    <input type="radio" name="reps" checked={repetitions === n} onChange={() => setRepetitions(n)} />
                    {n}
                  </label>
                ))}
              </div>
            </div>
          )}
          {overridable.includes('guide_style') && (
            <div className="field">
              <label>Guide style</label>
              <div className="seg">
                <label className="seg-opt">
                  <input type="radio" name="guide" checked={guide === 'dashed'} onChange={() => setGuide('dashed')} />
                  Grey
                </label>
                <label className="seg-opt">
                  <input type="radio" name="guide" checked={guide === 'faint'} onChange={() => setGuide('faint')} />
                  Faint
                </label>
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-block" onClick={print}>Print</button>
          <button className="btn btn-secondary btn-block" onClick={() => setVariant(variant + 1)}>
            Generate new practice
          </button>
          <Link href="/worksheets" className="btn btn-ghost btn-block">All worksheets</Link>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', margin: 0 }}>
            Re-printing gives the identical sheet. “New practice” shuffles it.
          </p>
          <div style={{ background: 'var(--color-sunshine-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', fontSize: 13, fontWeight: 600 }}>
            💡 There’s a star row at the bottom of every sheet — colouring a star per
            try turns corrections into celebrations.
          </div>
        </div>
      </div>
    </Shell>
  )
}
