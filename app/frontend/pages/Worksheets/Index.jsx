import { Link, usePage } from '@inertiajs/react'
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
  introduced: { label: 'practising', className: 'tag tag-accent' },
  not_started: { label: 'ready to try', className: 'tag tag-outline' },
}

function SheetCard({ row }) {
  const meta = TEMPLATE_META[row.template] || { emoji: '📄', label: row.template }
  const tag = STATE_TAGS[row.state] || STATE_TAGS.not_started
  const color = DOMAIN_COLOR[row.domain_code] || 'var(--color-accent)'

  return (
    <Link
      href={`/worksheets/${row.skill_id}`}
      className="stat-tile"
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        textDecoration: 'none', color: 'var(--color-text)',
        borderTop: `6px solid ${color}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 34, lineHeight: 1 }}>{meta.emoji}</span>
        <span className={tag.className}>{tag.label}</span>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {meta.label}
        </div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, lineHeight: 1.25 }}>
          {row.title}
        </div>
      </div>
      <span style={{ marginTop: 'auto', fontSize: 13.5, fontWeight: 800, color: 'var(--color-accent-600)' }}>
        Open & print →
      </span>
    </Link>
  )
}

export default function WorksheetsIndex({ groups }) {
  const { child } = usePage().props

  return (
    <Shell active="Worksheets">
      <div className="n">The printing press 🖨️</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-2)' }}>
        Worksheets, made fresh for {child?.name}
      </h1>
      <p style={{ fontSize: 15.5, color: 'var(--color-neutral-700)', maxWidth: '58ch', fontWeight: 600 }}>
        Every sheet is generated with {child?.name}’s name on it — re-printing gives the
        identical sheet, “new practice” shuffles the numbers. Print at home or send to the
        photocopy shop.
      </p>

      {groups.map((group) => (
        <section key={group.domain_code} style={{ marginTop: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 20, margin: '0 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{DOMAIN_EMOJI[group.domain_code]}</span>{group.domain}
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-neutral-500)' }}>
              · {group.rows.length} sheet{group.rows.length === 1 ? '' : 's'}
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'var(--space-3)' }}>
            {group.rows.map((row) => <SheetCard key={row.skill_id} row={row} />)}
          </div>
        </section>
      ))}
    </Shell>
  )
}
