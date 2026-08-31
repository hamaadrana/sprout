import { router, usePage } from '@inertiajs/react'
import { useState } from 'react'

const KIND_LABELS = {
  hands_on: 'Hands-on',
  worksheet: 'Worksheet',
  game: 'Game',
  conversation: 'Conversation',
}

const KIND_STYLES = {
  hands_on: 'bg-sage text-pine-deep',
  worksheet: 'bg-marigold-soft text-clay',
  game: 'bg-clay-soft text-clay',
  conversation: 'bg-cream text-ink-soft',
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-PK', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function PlanItemCard({ item, index }) {
  const [busy, setBusy] = useState(null)

  const logOutcome = (outcome) => {
    setBusy(outcome)
    router.post(
      `/plan_items/${item.id}/log`,
      { outcome },
      { preserveScroll: true, onFinish: () => setBusy(null) }
    )
  }

  if (item.state !== 'pending') {
    const gotIt = item.outcome === 'got_it'
    return (
      <div className="card-enter rounded-2xl border border-sage-line bg-white/60 px-5 py-4 flex items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            gotIt ? 'bg-pine text-paper' : 'bg-marigold text-ink'
          }`}
        >
          {gotIt ? '✓' : '↻'}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-ink truncate">{item.skill.title}</p>
          <p className="text-sm text-ink-soft">
            {gotIt ? 'Got it — well done.' : 'Marked for more practice. It will come around again.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <article
      className="card-enter rounded-2xl border border-sage-line bg-white shadow-sm overflow-hidden"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="px-6 pt-5 pb-4 border-b border-sage-line/70">
        <div className="flex items-center gap-2 mb-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${KIND_STYLES[item.activity.kind] || 'bg-cream text-ink-soft'}`}>
            {KIND_LABELS[item.activity.kind] || item.activity.kind}
          </span>
          <span className="text-xs text-ink-soft">{item.skill.domain}</span>
          <span className="ml-auto text-xs font-bold text-ink-soft">
            ~{item.activity.duration_minutes} min
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-pine-deep leading-snug">
          {item.skill.title}
        </h2>
        <p className="mt-1 font-bold text-ink">{item.activity.title}</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {item.activity.materials.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.activity.materials.map((m) => (
              <span key={m} className="rounded-md bg-cream px-2 py-1 text-xs text-ink-soft border border-sage-line/60">
                {m}
              </span>
            ))}
          </div>
        )}

        <p className="text-[15px] leading-relaxed text-ink">{item.activity.instructions}</p>

        <div className="rounded-xl bg-marigold-soft/70 border border-marigold/30 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-clay mb-1">
            What “got it” looks like
          </p>
          <p className="text-sm leading-relaxed text-ink">{item.skill.mastery_descriptor}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-6 pb-5">
        <button
          onClick={() => logOutcome('got_it')}
          disabled={busy !== null}
          className="rounded-xl bg-pine py-3 font-bold text-paper transition-colors hover:bg-pine-deep disabled:opacity-60 cursor-pointer"
        >
          {busy === 'got_it' ? 'Saving…' : 'Got it'}
        </button>
        <button
          onClick={() => logOutcome('needs_practice')}
          disabled={busy !== null}
          className="rounded-xl border-2 border-marigold bg-white py-3 font-bold text-ink transition-colors hover:bg-marigold-soft disabled:opacity-60 cursor-pointer"
        >
          {busy === 'needs_practice' ? 'Saving…' : 'Needs practice'}
        </button>
      </div>
    </article>
  )
}

export default function Today({ date, plan_items, all_done, nothing_left }) {
  const { props } = usePage()
  const childName = props.child?.name

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft">
            {formatDate(date)}
          </p>
          <form method="post" action="/users/sign_out">
            <input type="hidden" name="_method" value="delete" />
            <input
              type="hidden"
              name="authenticity_token"
              value={document.querySelector('meta[name="csrf-token"]')?.content || ''}
            />
            <button type="submit" className="text-xs text-ink-soft hover:text-ink cursor-pointer">
              Sign out
            </button>
          </form>
        </div>
        <h1 className="font-display text-4xl font-bold text-pine-deep mt-1">
          Today{childName ? ` with ${childName}` : ''}
        </h1>
      </header>

      {nothing_left ? (
        <div className="card-enter rounded-2xl border border-sage-line bg-white px-6 py-10 text-center">
          <p className="font-display text-2xl font-semibold text-pine-deep mb-2">
            Everything is mastered 🎉
          </p>
          <p className="text-ink-soft">
            {childName || 'Your child'} has worked through every skill currently in the
            curriculum. New material is coming.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plan_items.map((item, i) => (
            <PlanItemCard key={item.id} item={item} index={i} />
          ))}

          {all_done && (
            <div className="card-enter rounded-2xl bg-pine px-6 py-8 text-center text-paper">
              <p className="font-display text-2xl font-semibold mb-1">That’s today done.</p>
              <p className="text-paper/80 text-sm">
                Ten minutes of teaching, logged for good. See you tomorrow morning.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
