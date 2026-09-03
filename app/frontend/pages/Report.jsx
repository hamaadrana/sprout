import { Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../components/Shell'
import { DOMAIN_EMOJI, STRAND_EMOJI } from '../lib/flair'

const READINESS_TAGS = {
  met: { label: '✓ met', className: 'tag tag-neutral' },
  in_progress: { label: 'in progress', className: 'tag tag-accent' },
  not_yet: { label: 'not yet', className: 'tag tag-outline' },
}

function StatTile({ emoji, bg, value, label, sub }) {
  return (
    <div className="stat-tile" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <span className="emoji-badge" style={{ background: bg }}>{emoji}</span>
      <div>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-neutral-600)' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--color-neutral-500)' }}>{sub}</div>}
      </div>
    </div>
  )
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ height: 10, background: 'var(--color-neutral-200)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 0.5s ease' }} />
    </div>
  )
}

export default function Report(props) {
  const { child } = usePage().props
  const {
    month, month_label, prev_month, next_month, school_start,
    consistency, coverage, readiness, mastered_this_month, streak, recent_photos,
  } = props
  const [framing, setFraming] = useState(props.framing || 'coverage')

  const monthName = month_label.split(' ')[0]
  const onTrack = readiness.total > 0 && readiness.met >= Math.ceil(readiness.total * 0.6)
  const headline =
    framing === 'readiness'
      ? onTrack
        ? `${child?.name} is on track for admission 🎉`
        : `${child?.name} is building towards admission 💪`
      : `${child?.name} bagged ${mastered_this_month} skill${mastered_this_month === 1 ? '' : 's'} in ${monthName} 🎉`

  return (
    <Shell active="Progress">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <div className="n" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <span>Progress · {month_label}</span>
            <Link href={`/report?month=${prev_month}`} preserveScroll>←</Link>
            {next_month && <Link href={`/report?month=${next_month}`} preserveScroll>→</Link>}
          </div>
          <h1 style={{ fontSize: 36, margin: 'var(--space-2) 0 0' }}>{headline}</h1>
          <p style={{ margin: 'var(--space-2) 0 0', fontSize: 16, color: 'var(--color-neutral-700)' }}>
            {framing === 'readiness'
              ? school_start
                ? `School start: ${school_start.date_label} — ${school_start.months_away} months to go. Every square below counts.`
                : 'Tip: set a school start date to get the countdown.'
              : `${coverage.mastered} of ${coverage.total} skills covered so far. Slow and steady — that’s homeschooling done right.`}
          </p>
        </div>
        <div style={{ flex: 'none', textAlign: 'right' }}>
          <div className="n" style={{ marginBottom: 'var(--space-2)' }}>Show me</div>
          <div className="seg">
            <label className="seg-opt">
              <input type="radio" name="framing-report" checked={framing === 'coverage'} onChange={() => setFraming('coverage')} />
              🏡 Coverage
            </label>
            <label className="seg-opt">
              <input type="radio" name="framing-report" checked={framing === 'readiness'} onChange={() => setFraming('readiness')} />
              🎒 Readiness
            </label>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
        <StatTile emoji="🔥" bg="var(--color-sunshine-100)" value={streak} label={`day streak${streak >= 3 ? ' — keep it alive!' : ''}`} />
        <StatTile emoji="🗓️" bg="var(--color-sky-100)" value={`${consistency.active_days}/${consistency.total_days}`} label="days learning this month" />
        <StatTile emoji="🌟" bg="var(--color-green-100)" value={mastered_this_month} label={`skills mastered in ${monthName}`} />
        <StatTile emoji="🎓" bg="var(--color-pink-100)" value={`${readiness.met}/${readiness.total}`} label="readiness outcomes met" sub="vs the national curriculum" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
        <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 19, margin: '0 0 var(--space-1)' }}>🗓️ The learning calendar</h3>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '0 0 var(--space-3)' }}>
            A square lights up for every day you taught. It measures the habit, not the child.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, maxWidth: 280 }}>
            {[ 'M', 'T', 'W', 'T', 'F', 'S', 'S' ].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--color-neutral-400)' }}>{d}</div>
            ))}
            {Array.from({ length: (new Date(`${month}-01T00:00:00`).getDay() + 6) % 7 }, (_, i) => <div key={`pad${i}`} />)}
            {consistency.days.map((d) => (
              <div
                key={d.day}
                title={`${d.day} ${monthName}${d.active ? ' — taught!' : ''}`}
                style={{
                  aspectRatio: 1, borderRadius: 7,
                  display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 800,
                  background: d.active ? 'var(--color-green)' : d.future ? 'var(--color-neutral-100)' : 'var(--color-neutral-200)',
                  color: d.active ? '#fff' : 'var(--color-neutral-400)',
                  transition: 'transform 0.1s ease', cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {d.day}
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 19, margin: '0 0 var(--space-3)' }}>📈 Around the curriculum</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {coverage.domains.map((domain) => (
              <div key={domain.code}>
                <Link
                  href={`/skills?domain=${domain.code}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    textDecoration: 'none', color: 'var(--color-text)', fontWeight: 800, fontSize: 15,
                  }}
                >
                  <span>{DOMAIN_EMOJI[domain.code]} {domain.name}</span>
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>{domain.mastered}/{domain.total} →</span>
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                  {domain.strands.map((s) => (
                    <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 44px', gap: 8, alignItems: 'center', fontSize: 13 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {STRAND_EMOJI[s.name]} {s.name}
                      </span>
                      <Bar value={s.mastered} max={s.total} color={domain.code === 'NUM' ? 'var(--color-sky)' : 'var(--color-accent-2)'} />
                      <span style={{ color: 'var(--color-neutral-500)', fontWeight: 700, textAlign: 'right' }}>{s.mastered}/{s.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 19, margin: '0 0 var(--space-1)' }}>🎓 Ready for school?</h3>
          <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: '0 0 var(--space-3)' }}>
            Outcomes admission tests care about, mapped to ECE SLO codes from the National
            Curriculum 2022–23.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 14 }}>
            {readiness.outcomes.map((o) => {
              const tag = READINESS_TAGS[o.status]
              return (
                <div key={o.title} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
                  <span className={tag.className} style={{ flex: 'none' }}>{tag.label}</span>
                  <span>{o.title}</span>
                </div>
              )
            })}
          </div>
          <Link href="/skills" className="btn btn-ghost" style={{ marginTop: 'var(--space-3)' }}>
            See all {readiness.total} outcomes →
          </Link>
        </div>
      </div>

      {recent_photos.length > 0 && (
        <div className="card-panel" style={{ padding: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 style={{ fontSize: 19, margin: 0 }}>📸 Fresh off the fridge door</h3>
            <Link href="/portfolio" style={{ fontSize: 13.5, fontWeight: 800 }}>Whole portfolio →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {recent_photos.map((photo, i) => (
              <Link key={photo.id} href="/portfolio" title={photo.caption || ''}>
                <img
                  src={photo.thumb_url}
                  alt={photo.caption || 'A piece of work'}
                  loading="lazy"
                  style={{
                    aspectRatio: 1, width: '100%', objectFit: 'cover',
                    borderRadius: 14, border: '3px solid #fff', boxShadow: 'var(--shadow-md)',
                    transform: `rotate(${(i % 2 === 0 ? -1.5 : 1.5)}deg)`,
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="no-print" style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-primary" onClick={() => window.print()}>Download PDF report</button>
        <Link href={`/report/share?month=${month}`} className="btn btn-secondary">💌 Make a shareable card</Link>
      </div>
    </Shell>
  )
}
