import { router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../../components/Shell'
import { DOMAIN_EMOJI, STRAND_EMOJI } from '../../lib/flair'

const STATE_TAGS = {
  mastered: { label: '🌟 mastered', className: 'tag tag-neutral' },
  practising: { label: 'practising', className: 'tag tag-accent' },
  introduced: { label: 'introduced', className: 'tag tag-accent' },
  next: { label: '👉 next', className: 'tag tag-accent-2' },
  locked: { label: '🔒', className: 'tag tag-outline' },
  not_started: { label: 'not yet', className: 'tag tag-outline' },
}

const FILTERS = {
  all: () => true,
  in_progress: (s) => [ 'practising', 'introduced', 'next' ].includes(s.state),
  mastered: (s) => s.state === 'mastered',
  not_started: (s) => [ 'not_started', 'locked' ].includes(s.state),
}

function years(months) {
  const y = months / 12
  return Number.isInteger(y) ? `${y}` : y.toFixed(1).replace('.0', '')
}

function SkillRow({ skill, onSelect, selected }) {
  const tag = STATE_TAGS[skill.state] || STATE_TAGS.not_started
  const muted = [ 'locked', 'not_started' ].includes(skill.state)
  return (
    <button
      onClick={onSelect}
      style={{
        display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)',
        alignItems: 'baseline', width: '100%', textAlign: 'left',
        font: 'inherit', fontSize: 14.5, fontWeight: 600, cursor: 'pointer',
        background: selected ? 'var(--color-sunshine-100)' : 'none',
        border: 'none', padding: '5px 8px', margin: '0 -8px',
        borderRadius: 10,
        color: muted ? 'var(--color-neutral-500)' : 'var(--color-text)',
      }}
    >
      <span>{skill.title}</span>
      <span className={tag.className}>{tag.label}</span>
    </button>
  )
}

export default function SkillsIndex({ domain_code, domains, strands, selected_skill }) {
  const { child } = usePage().props
  const [filter, setFilter] = useState('all')
  const predicate = FILTERS[filter]

  const select = (skill) =>
    router.get('/skills', { domain: domain_code, skill: skill.id }, { preserveScroll: true, preserveState: true })

  const switchDomain = (code) => router.get('/skills', { domain: code })

  const act = (path) => router.post(path, {}, { preserveScroll: true })

  return (
    <Shell active="Skills">
      <div className="n">The whole map</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-4)' }}>
        Every skill, every strand
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', fontSize: 14, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="seg">
          {domains.map((d) => (
            <label key={d.code} className="seg-opt">
              <input
                type="radio"
                name="domain"
                checked={domain_code === d.code}
                onChange={() => switchDomain(d.code)}
              />
              {DOMAIN_EMOJI[d.code]} {d.name}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {Object.entries({ all: 'All', in_progress: 'In progress', mastered: 'Mastered', not_started: 'Not started' }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`chip-toggle ${filter === key ? 'picked' : ''}`}
              style={{ fontSize: 12.5, padding: '5px 12px' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
        {strands.map((strand) => {
          const pct = strand.total > 0 ? Math.round((strand.mastered / strand.total) * 100) : 0
          return (
            <div key={strand.name} className="card-panel" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-2)' }}>
                <span className="emoji-badge" style={{ background: 'var(--color-sky-100)', width: 38, height: 38, fontSize: 20 }}>
                  {STRAND_EMOJI[strand.name] || '✨'}
                </span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 18, margin: 0 }}>{strand.name}</h3>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--color-neutral-500)' }}>
                    {strand.mastered} of {strand.total} mastered
                  </div>
                </div>
              </div>
              <div style={{ height: 8, background: 'var(--color-neutral-200)', borderRadius: 999, overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-green)', borderRadius: 999 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {strand.skills.filter(predicate).map((skill) => (
                  <SkillRow
                    key={skill.code}
                    skill={skill}
                    selected={selected_skill?.id === skill.id}
                    onSelect={() => select(skill)}
                  />
                ))}
                {strand.skills.filter(predicate).length === 0 && (
                  <div style={{ fontSize: 13, color: 'var(--color-neutral-500)' }}>Nothing in this filter.</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected_skill && (
        <div
          className="card-panel card-enter"
          style={{
            marginTop: 'var(--space-6)', padding: 'var(--space-6)',
            display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 'var(--space-6)', alignItems: 'start',
            borderColor: 'var(--color-sunshine)',
          }}
        >
          <div>
            <div className="n">Skill spotlight</div>
            <h3 style={{ fontSize: 23, margin: 'var(--space-2) 0 var(--space-2)' }}>{selected_skill.title}</h3>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 15, color: 'var(--color-neutral-800)', maxWidth: '60ch' }}>
              🌟 <strong>Got it looks like:</strong> {selected_skill.mastery_descriptor}
            </p>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-neutral-500)' }}>
              {selected_skill.code}
              {selected_skill.slo_refs.length > 0 && <> · {selected_skill.slo_refs.join(', ')}</>}
              {' '}· ages {years(selected_skill.age_min_months)}–{years(selected_skill.age_max_months)}
              {' '}· {selected_skill.attempts} tr{selected_skill.attempts === 1 ? 'y' : 'ies'} so far
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {selected_skill.state !== 'mastered' && (
              <>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => act(`/skills/${selected_skill.id}/teach_next`)}
                >
                  Teach this today
                </button>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => act(`/skills/${selected_skill.id}/master`)}
                >
                  {child?.name} already knows this
                </button>
              </>
            )}
            {selected_skill.worksheet_id && (
              <a href={`/worksheets/${selected_skill.worksheet_id}`} className="btn btn-ghost btn-block">
                📝 Open the worksheet
              </a>
            )}
          </div>
        </div>
      )}
    </Shell>
  )
}
