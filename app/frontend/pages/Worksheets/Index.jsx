import { Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../../components/Shell'
import { DOMAIN_COLOR, DOMAIN_EMOJI } from '../../lib/flair'

const TEMPLATE_META = {
  numeral_tracing: { emoji: '✏️', label: 'Trace numbers' },
  letter_tracing: { emoji: '🔤', label: 'Trace letters' },
  word_tracing: { emoji: '📝', label: 'Trace words' },
  count_and_write: { emoji: '🔢', label: 'Count & write' },
  count_and_circle: { emoji: '⭕', label: 'Count & circle' },
  ten_frame: { emoji: '🔟', label: 'Ten frames' },
  match_quantity_numeral: { emoji: '🔗', label: 'Match & count' },
  more_or_less: { emoji: '⚖️', label: 'More or less' },
  pattern_completion: { emoji: '🔁', label: 'Patterns' },
  shape_tracing: { emoji: '🔷', label: 'Trace shapes' },
  size_ordering: { emoji: '📐', label: 'Size ordering' },
  letter_case_match: { emoji: '🅰️', label: 'Big & small letters' },
  colour_by_shape: { emoji: '🌈', label: 'Colour by shape' },
}

const STATE_TAGS = {
  mastered: { label: '🌟 mastered', className: 'tag tag-neutral' },
  practising: { label: 'practising', className: 'tag tag-accent' },
  next: { label: '👉 next', className: 'tag tag-accent-2' },
  not_started: { label: 'ready to try', className: 'tag tag-outline' },
}

const STATE_FILTERS = {
  all: () => true,
  in_progress: (r) => [ 'practising', 'next' ].includes(r.state),
  mastered: (r) => r.state === 'mastered',
  not_started: (r) => r.state === 'not_started',
}

const LEVEL_LABELS = { 1: '🌱 starter', 2: '🌿 growing', 3: '🌳 confident' }

function SheetCard({ row }) {
  const meta = TEMPLATE_META[row.template] || { emoji: '📄', label: row.template }
  const tag = STATE_TAGS[row.state] || STATE_TAGS.not_started
  const color = DOMAIN_COLOR[row.domain_code] || 'var(--color-accent)'

  return (
    <Link
      href={`/worksheets/${row.id}`}
      className="stat-tile"
      style={{
        display: 'flex', flexDirection: 'column', gap: 8,
        textDecoration: 'none', color: 'var(--color-text)',
        borderTop: `6px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 32, lineHeight: 1 }}>{meta.emoji}</span>
        <span className={tag.className}>{tag.label}</span>
      </div>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {meta.label} · {LEVEL_LABELS[row.level]}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16.5, lineHeight: 1.25 }}>
          {row.title}
        </div>
      </div>
      <span style={{ marginTop: 'auto', fontSize: 13, fontWeight: 800, color: 'var(--color-accent-600)' }}>
        Open & print →
      </span>
    </Link>
  )
}

export default function WorksheetsIndex({ rows, domains }) {
  const { child } = usePage().props
  const [domain, setDomain] = useState('all')
  const [state, setState] = useState('all')
  const [level, setLevel] = useState('all')

  const visible = rows.filter(
    (r) =>
      (domain === 'all' || r.domain_code === domain) &&
      STATE_FILTERS[state](r) &&
      (level === 'all' || r.level === level)
  )

  const chip = (active, onClick, children, key) => (
    <button key={key} onClick={onClick} className={`chip-toggle ${active ? 'picked' : ''}`} style={{ fontSize: 12.5, padding: '5px 12px' }}>
      {children}
    </button>
  )

  return (
    <Shell active="Worksheets">
      <div className="n">The printing press 🖨️ · {rows.length} sheets</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-2)' }}>
        Worksheets, made fresh for {child?.name}
      </h1>
      <p style={{ fontSize: 15.5, color: 'var(--color-neutral-700)', maxWidth: '58ch', fontWeight: 600, margin: '0 0 var(--space-4)' }}>
        Every sheet prints with {child?.name}’s name on it. Re-printing gives the identical
        sheet; “new practice” shuffles it. Print at home or at the photocopy shop.
      </p>

      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div className="seg" style={{ flexWrap: 'wrap' }}>
          <label className="seg-opt">
            <input type="radio" name="ws-domain" checked={domain === 'all'} onChange={() => setDomain('all')} />
            All
          </label>
          {domains.map((d) => (
            <label key={d.code} className="seg-opt">
              <input type="radio" name="ws-domain" checked={domain === d.code} onChange={() => setDomain(d.code)} />
              {DOMAIN_EMOJI[d.code]} {d.name}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {Object.entries({ all: 'All', in_progress: 'In progress', mastered: 'Mastered', not_started: 'Not started' }).map(([key, label]) =>
            chip(state === key, () => setState(key), label, key)
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {chip(level === 'all', () => setLevel('all'), 'Any level', 'lvl-all')}
          {[ 1, 2, 3 ].map((n) => chip(level === n, () => setLevel(n), LEVEL_LABELS[n], `lvl-${n}`))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p style={{ color: 'var(--color-neutral-600)', fontWeight: 600 }}>
          Nothing matches those filters — try widening them.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(225px, 1fr))', gap: 'var(--space-3)' }}>
          {visible.map((row) => <SheetCard key={row.id} row={row} />)}
        </div>
      )}
    </Shell>
  )
}
