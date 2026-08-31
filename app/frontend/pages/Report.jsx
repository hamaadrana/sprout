import { Link, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../components/Shell'

const READINESS_TAGS = {
  met: { label: 'met', className: 'tag tag-neutral' },
  in_progress: { label: 'in progress', className: 'tag tag-accent' },
  not_yet: { label: 'not yet', className: 'tag tag-outline' },
}

function Bar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ height: 6, background: 'var(--color-neutral-300)' }}>
      <div style={{ width: `${pct}%`, height: 6, background: 'var(--color-accent)' }} />
    </div>
  )
}

export default function Report(props) {
  const { child } = usePage().props
  const {
    month, month_label, prev_month, next_month, school_start,
    consistency, coverage, readiness, mastered_this_month,
  } = props
  const [framing, setFraming] = useState(props.framing || 'coverage')

  const readinessHeadline =
    readiness.total > 0 && readiness.met >= Math.ceil(readiness.total * 0.6)
      ? `${child?.name} is on track for admission`
      : `${child?.name} is building towards admission`
  const coverageHeadline = `${child?.name} mastered ${mastered_this_month} skill${mastered_this_month === 1 ? '' : 's'} in ${month_label.split(' ')[0]}`

  return (
    <Shell active="Report">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <div className="n" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span>Report · {month_label}</span>
            <Link href={`/report?month=${prev_month}`} style={{ color: 'var(--color-accent-700)' }} preserveScroll>←</Link>
            {next_month && (
              <Link href={`/report?month=${next_month}`} style={{ color: 'var(--color-accent-700)' }} preserveScroll>→</Link>
            )}
          </div>
          <h1 style={{ fontSize: 36, margin: 'var(--space-2) 0 0' }}>
            {framing === 'readiness' ? readinessHeadline : coverageHeadline}
          </h1>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 16, color: 'var(--color-neutral-700)' }}>
            {framing === 'readiness'
              ? school_start
                ? `School start set for ${school_start.date_label} — ${school_start.months_away} months away.`
                : 'Set a school start date in onboarding to see the countdown.'
              : `${coverage.mastered} of ${coverage.total} skills covered so far, across every strand.`}
          </p>
        </div>
        <div style={{ flex: 'none', textAlign: 'right' }}>
          <div className="n" style={{ marginBottom: 'var(--space-2)' }}>Framing</div>
          <div className="seg">
            <label className="seg-opt">
              <input type="radio" name="framing-report" checked={framing === 'coverage'} onChange={() => setFraming('coverage')} />
              Coverage
            </label>
            <label className="seg-opt">
              <input type="radio" name="framing-report" checked={framing === 'readiness'} onChange={() => setFraming('readiness')} />
              Readiness
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
        <div>
          <div className="n">Consistency</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1, margin: 'var(--space-2) 0' }}>
            {consistency.active_days}{' '}
            <span style={{ fontSize: 18, color: 'var(--color-neutral-600)' }}>/ {consistency.total_days} days</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2, maxWidth: 240 }}>
            {consistency.days.map((d) => (
              <div
                key={d.day}
                title={`Day ${d.day}`}
                style={{
                  aspectRatio: 1,
                  background: d.active
                    ? 'var(--color-accent)'
                    : d.future
                      ? 'var(--color-neutral-200)'
                      : 'var(--color-neutral-300)',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 'var(--space-3) 0 0' }}>
            Days with at least one logged session. Measures the habit, not the child.
          </p>
        </div>

        <div>
          <div className="n">Coverage</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1, margin: 'var(--space-2) 0' }}>
            {coverage.mastered}{' '}
            <span style={{ fontSize: 18, color: 'var(--color-neutral-600)' }}>/ {coverage.total} skills</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14, maxWidth: 260 }}>
            {coverage.strands.map((s) => (
              <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{s.name}</span>
                  <span style={{ color: 'var(--color-neutral-600)' }}>{s.mastered} / {s.total}</span>
                </div>
                <Bar value={s.mastered} max={s.total} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="n">Readiness against the national curriculum</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1, margin: 'var(--space-2) 0' }}>
            {readiness.met}{' '}
            <span style={{ fontSize: 18, color: 'var(--color-neutral-600)' }}>/ {readiness.total} outcomes</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
            {readiness.outcomes.map((o) => {
              const tag = READINESS_TAGS[o.status]
              return (
                <div key={o.title} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
                  <span className={tag.className}>{tag.label}</span>
                  <span>{o.title}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 'var(--space-3) 0 0' }}>
            Mapped to ECE SLO codes from the National Curriculum 2022–23.
          </p>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-8)' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>Download PDF report</button>
        <Link href={`/report/share?month=${month}`} className="btn btn-secondary">Make a shareable card</Link>
      </div>
    </Shell>
  )
}
