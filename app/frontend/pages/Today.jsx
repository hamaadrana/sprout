import { Link, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../components/Shell'

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function DoneRow({ item }) {
  const gotIt = item.outcome === 'got_it'
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)',
      }}
    >
      <span className={gotIt ? 'tag tag-accent' : 'tag tag-accent-2'}>
        {gotIt ? 'got it' : 'needs practice'}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
          {item.skill.title}
        </div>
        <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
          {gotIt ? 'Logged — well done.' : 'Logged. It stays in the plan until it lands.'}
        </div>
      </div>
    </div>
  )
}

function ActivityCard({ item, index, expanded, onExpand }) {
  if (item.state !== 'pending') return <DoneRow item={item} />

  if (!expanded) {
    return (
      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--space-8)',
          alignItems: 'center', padding: 'var(--space-4) var(--space-6)',
          background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)',
        }}
      >
        <div>
          <div className="n">
            Activity {index + 1} · {item.activity.kind} · {item.activity.duration_minutes} min
          </div>
          <h2 style={{ fontSize: 22, margin: 'var(--space-2) 0 0' }}>{item.skill.title}</h2>
        </div>
        <button className="btn btn-secondary btn-block" onClick={onExpand}>Open</button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '1fr 260px', gap: 'var(--space-8)',
        alignItems: 'start', padding: 'var(--space-6)',
        background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)',
      }}
    >
      <div>
        <div className="n">
          Activity {index + 1} · {item.activity.kind} · {item.activity.duration_minutes} min
        </div>
        <h2 style={{ fontSize: 26, margin: 'var(--space-2) 0 var(--space-3)' }}>
          {item.skill.title}
        </h2>
        <p style={{ margin: '0 0 var(--space-3)', fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-800)', maxWidth: '52ch' }}>
          {item.activity.title} — {item.activity.instructions}
        </p>
        <details style={{ fontSize: 14 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--color-accent-700)', fontWeight: 600 }}>
            Materials and what “got it” looks like
          </summary>
          <div style={{ paddingTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', color: 'var(--color-neutral-700)' }}>
            {item.activity.materials.length > 0 && (
              <div>Materials: {item.activity.materials.join(' · ')}</div>
            )}
            <div style={{ maxWidth: '58ch' }}>
              <strong style={{ color: 'var(--color-text)' }}>Got it looks like:</strong>{' '}
              {item.skill.mastery_descriptor}
            </div>
          </div>
        </details>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Link
          href={`/plan_items/${item.id}/log`}
          className="btn btn-primary btn-block"
          style={{ fontSize: 17, padding: 'var(--space-3) var(--space-4)' }}
        >
          Start
        </Link>
        <Link href="/skills" className="btn btn-ghost btn-block">Swap this activity</Link>
        {item.has_worksheet && (
          <Link href={`/worksheets/${item.skill.id}`} className="btn btn-ghost btn-block">
            Print a worksheet
          </Link>
        )}
        <div className="n" style={{ marginTop: 'var(--space-2)', color: 'var(--color-neutral-600)' }}>
          Start opens the log sheet
        </div>
      </div>
    </div>
  )
}

export default function Today({ date, total_minutes, pending_count, progress, plan_items }) {
  const { child } = usePage().props
  const firstPendingId = plan_items.find((i) => i.state === 'pending')?.id
  const [expandedId, setExpandedId] = useState(firstPendingId)
  const allDone = plan_items.length > 0 && plan_items.every((i) => i.state !== 'pending')
  const pct = progress.total > 0 ? Math.round((progress.mastered / progress.total) * 100) : 0

  const headline = allDone
    ? `That’s today done`
    : plan_items.length === 0
      ? `Nothing left to plan`
      : `${pending_count === 1 ? 'One thing' : 'Two things'} with ${child?.name} today`

  return (
    <Shell active="Today">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div>
          <div className="n">{formatDate(date)}</div>
          <h1 style={{ fontSize: 40, margin: 'var(--space-2) 0 var(--space-1)' }}>{headline}</h1>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--color-neutral-700)' }}>
            {allDone
              ? 'Logged for good. See you tomorrow morning.'
              : plan_items.length === 0
                ? `${child?.name} has worked through every skill currently in the curriculum.`
                : `About ${total_minutes} minutes. ${progress.domain}, picking up where you left off.`}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--color-neutral-600)', flex: 'none' }}>
          <div>{progress.mastered} of {progress.total} {progress.domain.toLowerCase()} skills mastered</div>
          <div style={{ display: 'flex', marginTop: 'var(--space-2)', justifyContent: 'flex-end', width: 320, maxWidth: '100%', height: 6, background: 'var(--color-neutral-300)', borderRadius: 1 }}>
            <div style={{ width: `${pct}%`, height: 6, background: 'var(--color-accent)', borderRadius: 1, marginRight: 'auto' }} />
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
      </div>

      <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', fontSize: 14, color: 'var(--color-neutral-700)', flexWrap: 'wrap' }}>
        <span>{allDone ? 'Want more?' : 'Done for today?'}</span>
        <Link href="/skills" style={{ color: 'var(--color-accent-700)' }}>Browse all skills</Link>
        <Link href="/activities" style={{ color: 'var(--color-accent-700)' }}>Extra activities and things to make</Link>
      </div>
    </Shell>
  )
}
