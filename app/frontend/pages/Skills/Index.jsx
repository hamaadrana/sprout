import { Link, router } from '@inertiajs/react'
import { useState } from 'react'

const BADGES = {
  not_started: { label: 'Not started', className: 'bg-cream text-ink-soft border border-sage-line' },
  introduced: { label: 'Introduced', className: 'bg-sage text-pine-deep' },
  practising: { label: 'Practising', className: 'bg-marigold-soft text-clay border border-marigold/40' },
  mastered: { label: '✓ Mastered', className: 'bg-pine text-paper' },
}

function years(months) {
  const y = months / 12
  return Number.isInteger(y) ? `${y}` : `${Math.floor(y)}½`
}

function SkillRow({ skill, swapPlanItemId }) {
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const badge = BADGES[skill.state] || BADGES.not_started
  const locked = !skill.ready && skill.state === 'not_started'

  const markMastered = () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setBusy(true)
    router.post(`/skills/${skill.id}/master`, {}, { preserveScroll: true, onFinish: () => setBusy(false) })
  }

  const teachToday = () => {
    setBusy(true)
    router.patch(
      `/plan_items/${swapPlanItemId}/swap`,
      { skill_id: skill.id },
      { onFinish: () => setBusy(false) }
    )
  }

  return (
    <li className={`px-4 py-3 sm:px-5 flex flex-wrap items-center gap-x-4 gap-y-2 ${locked ? 'opacity-55' : ''}`}>
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-bold text-ink leading-snug">{skill.title}</p>
        <p className="text-xs text-ink-soft mt-0.5">
          Ages {years(skill.age_min_months)}–{years(skill.age_max_months)}
          {locked && skill.unmet_prerequisites.length > 0 && (
            <span className="ml-2 text-clay">
              · after {skill.unmet_prerequisites.join(', ')}
            </span>
          )}
        </p>
      </div>

      <span className={`rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${badge.className}`}>
        {badge.label}
      </span>

      {skill.state !== 'mastered' &&
        (swapPlanItemId ? (
          <button
            onClick={teachToday}
            disabled={busy}
            className="rounded-lg bg-pine px-3 py-1.5 text-xs font-bold text-paper hover:bg-pine-deep disabled:opacity-60 cursor-pointer whitespace-nowrap"
          >
            Teach this today
          </button>
        ) : (
          <button
            onClick={markMastered}
            disabled={busy}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-60 cursor-pointer whitespace-nowrap ${
              confirming
                ? 'bg-marigold text-ink border border-marigold'
                : 'border border-sage-line bg-white text-ink-soft hover:border-pine hover:text-pine'
            }`}
          >
            {confirming ? 'Tap again to confirm' : 'Mark mastered'}
          </button>
        ))}
    </li>
  )
}

export default function SkillsIndex({ domains, swap_plan_item_id }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft hover:text-pine">
          ← Today
        </Link>
        <h1 className="font-display text-4xl font-bold text-pine-deep mt-1">Skill library</h1>
      </header>

      {swap_plan_item_id && (
        <div className="card-enter mb-6 rounded-xl bg-marigold-soft border border-marigold/40 px-4 py-3 text-sm text-ink">
          <span className="font-bold">Choosing a swap.</span> Pick the skill you want to teach
          today instead — it will replace the planned activity.
        </div>
      )}

      <div className="space-y-8">
        {domains.map((domain) => (
          <section key={domain.code} className="card-enter">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-pine-deep">
                {domain.name}
                {domain.name_ur && <span className="ml-2 text-lg text-ink-soft">{domain.name_ur}</span>}
              </h2>
              <p className="text-xs font-bold text-ink-soft">
                {domain.mastered_count} of {domain.skill_count} mastered
              </p>
            </div>
            <ul className="divide-y divide-sage-line/70 rounded-2xl border border-sage-line bg-white shadow-sm">
              {domain.skills.map((skill) => (
                <SkillRow key={skill.code} skill={skill} swapPlanItemId={swap_plan_item_id} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
