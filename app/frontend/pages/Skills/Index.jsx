import { router } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../../components/Shell'

const STATE_TAGS = {
  mastered: { label: 'mastered', className: 'tag tag-neutral' },
  practising: { label: 'practising', className: 'tag tag-accent' },
  introduced: { label: 'introduced', className: 'tag tag-accent' },
  next: { label: 'next', className: 'tag tag-outline' },
  locked: { label: 'locked', className: 'tag tag-outline' },
  not_started: { label: 'not started', className: 'tag tag-outline' },
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
        font: 'inherit', fontSize: 14, cursor: 'pointer',
        background: selected ? 'var(--color-accent-100)' : 'none',
        border: 'none', padding: '3px 6px', margin: '0 -6px',
        borderRadius: 'var(--radius-md)',
        color: muted ? 'var(--color-neutral-600)' : 'var(--color-text)',
      }}
    >
      <span>{skill.title}</span>
      <span className={tag.className}>{tag.label}</span>
    </button>
  )
}

export default function SkillsIndex({ domain_name, strands, selected_skill }) {
  const [filter, setFilter] = useState('all')
  const predicate = FILTERS[filter]

  const select = (skill) =>
    router.get('/skills', { skill: skill.id }, { preserveScroll: true, preserveState: true })

  const act = (path) => router.post(path, {}, { preserveScroll: true })

  return (
    <Shell active="Skills">
      <div className="n">Skill library</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-4)' }}>{domain_name}</h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', fontSize: 14, marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="seg">
          <label className="seg-opt"><input type="radio" name="domain" defaultChecked readOnly />{domain_name}</label>
        </div>
        <span style={{ color: 'var(--color-neutral-600)' }}>Filter:</span>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {Object.entries({ all: 'All', in_progress: 'In progress', mastered: 'Mastered', not_started: 'Not started' }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`tag ${filter === key ? 'tag-accent' : 'tag-outline'}`}
              style={{ cursor: 'pointer', background: filter === key ? undefined : 'none', font: 'inherit', fontSize: 11 }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-8)' }}>
        {strands.map((strand) => (
          <div key={strand.name}>
            <h3 style={{ fontSize: 17, margin: '0 0 var(--space-3)' }}>
              {strand.name}{' '}
              <span style={{ color: 'var(--color-neutral-600)', fontWeight: 400 }}>
                · {strand.mastered} of {strand.total}
              </span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {strand.skills.filter(predicate).map((skill) => (
                <SkillRow
                  key={skill.code}
                  skill={skill}
                  selected={selected_skill?.id === skill.id}
                  onSelect={() => select(skill)}
                />
              ))}
              {strand.skills.filter(predicate).length === 0 && (
                <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>Nothing here.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected_skill && (
        <div
          style={{
            marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-divider)',
            display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-8)', alignItems: 'start',
          }}
        >
          <div>
            <div className="n">Selected skill</div>
            <h3 style={{ fontSize: 22, margin: 'var(--space-2) 0 var(--space-2)' }}>{selected_skill.title}</h3>
            <p style={{ margin: '0 0 var(--space-2)', fontSize: 15, color: 'var(--color-neutral-800)', maxWidth: '60ch' }}>
              Got it looks like: {selected_skill.mastery_descriptor}
            </p>
            <div style={{ fontSize: 13, color: 'var(--color-neutral-600)' }}>
              {selected_skill.code}
              {selected_skill.slo_refs.length > 0 && <> · {selected_skill.slo_refs.join(', ')}</>}
              {' '}· ages {years(selected_skill.age_min_months)}–{years(selected_skill.age_max_months)} years
              {' '}· {selected_skill.attempts} attempt{selected_skill.attempts === 1 ? '' : 's'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {selected_skill.state !== 'mastered' && (
              <>
                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => act(`/skills/${selected_skill.id}/teach_next`)}
                >
                  Teach this today
                </button>
                <button
                  className="btn btn-ghost btn-block"
                  onClick={() => act(`/skills/${selected_skill.id}/master`)}
                >
                  She already knows this
                </button>
              </>
            )}
            {selected_skill.has_worksheet && (
              <a href={`/worksheets/${selected_skill.id}`} className="btn btn-ghost btn-block">
                Open the worksheet
              </a>
            )}
          </div>
        </div>
      )}
    </Shell>
  )
}
