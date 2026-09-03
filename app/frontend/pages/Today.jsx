import { Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../components/Shell'
import { DOMAIN_EMOJI, KIND_EMOJI, PERSONALITY_LABELS } from '../lib/flair'

const CONFETTI_COLORS = ['#f4572e', '#ffc53d', '#3ca566', '#2f97d8', '#7c4ddb', '#ff8fb1']

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function Confetti() {
  return (
    <>
      {Array.from({ length: 18 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${(i * 137) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i * 0.23) % 2.8}s`,
            borderRadius: i % 3 === 0 ? '50%' : 2,
          }}
        />
      ))}
    </>
  )
}

function DoneRow({ item }) {
  const gotIt = item.outcome === 'got_it'
  return (
    <div
      className="card-panel"
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)' }}
    >
      <span style={{ fontSize: 26 }}>{gotIt ? '🌟' : '💪'}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>{item.skill.title}</div>
        <div style={{ fontSize: 13.5, color: 'var(--color-neutral-600)' }}>
          {gotIt ? 'Got it — logged and celebrated.' : 'Good try logged. It comes back around until it clicks.'}
        </div>
      </div>
      <span className={gotIt ? 'tag tag-neutral' : 'tag tag-accent'} style={{ marginLeft: 'auto' }}>
        {gotIt ? 'got it' : 'practising'}
      </span>
    </div>
  )
}

function ActivityCard({ item, index, expanded, onExpand }) {
  if (item.state !== 'pending') return <DoneRow item={item} />

  const kindEmoji = KIND_EMOJI[item.activity.kind] || '🙌'
  const domainEmoji = DOMAIN_EMOJI[item.skill.domain] || '✨'

  if (!expanded) {
    return (
      <div
        className="card-panel"
        style={{
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)',
          alignItems: 'center', padding: 'var(--space-4) var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
          <span className="emoji-badge" style={{ background: 'var(--color-sky-100)' }}>{domainEmoji}</span>
          <div style={{ minWidth: 0 }}>
            <div className="n">Up next · {item.skill.domain} · {item.activity.duration_minutes} min</div>
            <h2 style={{ fontSize: 21, margin: '2px 0 0' }}>{item.skill.title}</h2>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={onExpand}>Peek 👀</button>
      </div>
    )
  }

  return (
    <article
      className="card-panel card-enter"
      style={{
        display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 250px', gap: 'var(--space-6)',
        alignItems: 'start', padding: 'var(--space-6)',
      }}
    >
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="tag tag-accent">{kindEmoji} {item.activity.kind}</span>
          <span className="tag tag-outline">{domainEmoji} {item.skill.domain} · {item.skill.strand}</span>
          <span className="tag tag-outline">⏱️ {item.activity.duration_minutes} min</span>
        </div>
        <h2 style={{ fontSize: 27, margin: 'var(--space-3) 0 var(--space-2)' }}>{item.skill.title}</h2>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 15.5, lineHeight: 1.6, color: 'var(--color-neutral-800)', maxWidth: '55ch' }}>
          <strong>{item.activity.title}.</strong> {item.activity.instructions}
        </p>
        <details style={{ fontSize: 14.5 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--color-accent-600)', fontWeight: 800 }}>
            Materials & what “got it” looks like
          </summary>
          <div style={{ paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-neutral-700)' }}>
            {item.activity.materials.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.activity.materials.map((m) => (
                  <span key={m} className="tag tag-outline">🧺 {m}</span>
                ))}
              </div>
            )}
            <div style={{ maxWidth: '58ch', background: 'var(--color-green-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
              <strong style={{ color: 'var(--color-text)' }}>🌟 Got it looks like:</strong>{' '}
              {item.skill.mastery_descriptor}
            </div>
          </div>
        </details>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Link
          href={`/plan_items/${item.id}/log`}
          className="btn btn-primary btn-block"
          style={{ fontSize: 18, padding: '14px 20px' }}
        >
          Let’s do it! ✨
        </Link>
        <Link href="/skills" className="btn btn-ghost btn-block">Swap this one</Link>
        {item.has_worksheet && (
          <Link href={`/worksheets/${item.skill.id}`} className="btn btn-ghost btn-block">
            📝 Print the worksheet
          </Link>
        )}
      </div>
    </article>
  )
}

export default function Today({ date, total_minutes, pending_count, progress, plan_items }) {
  const { child } = usePage().props
  const firstPendingId = plan_items.find((i) => i.state === 'pending')?.id
  const [expandedId, setExpandedId] = useState(firstPendingId)
  const allDone = plan_items.length > 0 && plan_items.every((i) => i.state !== 'pending')
  const pct = progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0
  const personality = PERSONALITY_LABELS[child?.personality]

  const headline = allDone
    ? `${child?.name} did it today! 🎉`
    : plan_items.length === 0
      ? 'Everything conquered! 🏆'
      : `${pending_count === 1 ? 'One little win' : 'Two little wins'} with ${child?.name} today`

  return (
    <Shell active="Today">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <div className="n" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span>{formatDate(date)}</span>
            {child?.framing === 'readiness' && child?.months_to_school != null && (
              <span className="tag tag-accent-2">🎒 {child.months_to_school} months to school</span>
            )}
            {child?.framing === 'coverage' && (
              <span className="tag tag-accent-2">🏡 homeschool mode</span>
            )}
          </div>
          <h1 style={{ fontSize: 40, margin: 'var(--space-2) 0 var(--space-1)' }}>{headline}</h1>
          <p style={{ margin: 0, fontSize: 16.5, color: 'var(--color-neutral-700)' }}>
            {allDone
              ? 'All logged. Same time tomorrow — the plan is already thinking about it.'
              : plan_items.length === 0
                ? `${child?.name} has worked through every skill in the plan. New material is coming.`
                : `About ${total_minutes} minutes${personality ? `, picked for your ${personality}` : ''}. Everything ready below.`}
          </p>
        </div>
        <div style={{ textAlign: 'right', flex: 'none' }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-neutral-600)' }}>
            🌟 {progress.mastered} of {progress.total} skills mastered
          </div>
          <div style={{ marginTop: 'var(--space-2)', width: 300, maxWidth: '100%', height: 12, background: 'var(--color-neutral-200)', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(pct, 2)}%`, height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, var(--color-sunshine), var(--color-accent))',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-8)' }}>
        {plan_items.map((item, i) => (
          <ActivityCard
            key={item.id}
            item={item}
            index={i}
            expanded={expandedId === item.id}
            onExpand={() => setExpandedId(item.id)}
          />
        ))}

        {allDone && (
          <div
            className="confetti card-enter"
            style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-2) 100%)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-8) var(--space-6)',
              textAlign: 'center', color: '#fff',
            }}
          >
            <Confetti />
            <div style={{ fontSize: 44 }}>🎉</div>
            <h2 style={{ color: '#fff', margin: 'var(--space-2) 0 var(--space-1)' }}>That’s today in the bag!</h2>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
              Fifteen minutes today. A whole curriculum, one day at a time.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center', fontSize: 14.5, fontWeight: 700, color: 'var(--color-neutral-700)', flexWrap: 'wrap' }}>
        <span>{allDone ? 'Still got energy?' : 'Want something different?'}</span>
        <Link href="/skills">🗺️ All skills</Link>
        <Link href="/activities">🎨 Extra activities & crafts</Link>
      </div>
    </Shell>
  )
}
