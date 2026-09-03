import { useForm, usePage } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../components/Shell'
import { GOALS, PERSONALITIES } from '../lib/childOptions'

export default function Settings({ child_form, errors = {} }) {
  const { child, app_name } = usePage().props
  const [saved, setSaved] = useState(false)
  const { data, setData, patch, processing, isDirty, transform } = useForm({
    name: child_form.name || '',
    date_of_birth: child_form.date_of_birth || '',
    gender: child_form.gender,
    framing: child_form.framing,
    target_school_start_on: child_form.target_school_start_on || '',
    personality: child_form.personality,
    loves: child_form.loves || '',
    goals: child_form.goals || [],
  })

  transform((d) => ({
    child: {
      name: d.name,
      date_of_birth: d.date_of_birth,
      gender: d.gender,
      framing: d.framing,
      target_school_start_on: d.framing === 'readiness' ? d.target_school_start_on || '' : '',
      traits: { personality: d.personality, loves: d.loves },
      goals: d.goals.length > 0 ? d.goals : [''],
    },
  }))

  const save = (e) => {
    e.preventDefault()
    patch('/child', {
      preserveScroll: true,
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      },
    })
  }

  const toggleGoal = (key) =>
    setData('goals', data.goals.includes(key) ? data.goals.filter((k) => k !== key) : [...data.goals, key])

  const sectionTitle = (emoji, text) => (
    <h3 style={{ fontSize: 20, margin: 'var(--space-6) 0 var(--space-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{emoji}</span>{text}
    </h3>
  )

  const errorFor = (field) =>
    errors[field] && (
      <p style={{ color: 'var(--color-accent-600)', fontSize: 13, margin: '4px 0 0' }}>{errors[field][0]}</p>
    )

  return (
    <Shell active="Settings">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="n">Settings</div>
        <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-1)' }}>
          All about {child?.name}
        </h1>
        <p style={{ color: 'var(--color-neutral-700)', fontWeight: 600, margin: 0 }}>
          Everything here tunes the plan, the copy and the report. Change it any time.
        </p>

        <form onSubmit={save}>
          {sectionTitle('🪪', 'The basics')}
          <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
              <div className="field">
                <label>Name</label>
                <input className="input" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                {errorFor('name')}
              </div>
              <div className="field">
                <label>Birthday</label>
                <input className="input" type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                {errorFor('date_of_birth')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {[['girl', '👧', 'A girl'], ['boy', '👦', 'A boy']].map(([value, emoji, label]) => (
                <button
                  key={value}
                  type="button"
                  className="pick-card"
                  aria-pressed={data.gender === value}
                  onClick={() => setData('gender', value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: 'auto', padding: '10px 20px' }}
                >
                  <span style={{ fontSize: 24 }}>{emoji}</span>
                  <span style={{ fontWeight: 800 }}>{label}</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 'var(--space-3) 0 0' }}>
              {app_name} writes every instruction with the right words for {data.gender === 'boy' ? 'him' : 'her'}.
            </p>
          </div>

          {sectionTitle('🧭', 'Your reason')}
          <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="pick-card"
                aria-pressed={data.framing === 'readiness'}
                onClick={() => setData('framing', 'readiness')}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 26 }}>🎒</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Getting ready for school</span>
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>Readiness view, with the countdown.</span>
                </span>
              </button>
              <button
                type="button"
                className="pick-card"
                aria-pressed={data.framing === 'coverage'}
                onClick={() => setData('framing', 'coverage')}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 26 }}>🏡</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Learning at home</span>
                  <span style={{ fontSize: 13, color: 'var(--color-neutral-700)' }}>Coverage view of the whole curriculum.</span>
                </span>
              </button>
            </div>
            {data.framing === 'readiness' && (
              <div className="field" style={{ marginTop: 'var(--space-4)', maxWidth: 280 }}>
                <label>School start <span style={{ color: 'var(--color-neutral-500)' }}>(optional)</span></label>
                <input
                  className="input"
                  type="month"
                  value={data.target_school_start_on?.slice(0, 7) || ''}
                  onChange={(e) => setData('target_school_start_on', e.target.value ? `${e.target.value}-01` : '')}
                />
              </div>
            )}
          </div>

          {sectionTitle('✨', 'Personality & goals')}
          <div className="card-panel" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {PERSONALITIES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`chip-toggle ${data.personality === p.key ? 'picked' : ''}`}
                  onClick={() => setData('personality', p.key)}
                >
                  <span>{p.emoji}</span>{p.title}
                </button>
              ))}
            </div>
            <div className="field" style={{ margin: 'var(--space-4) 0', maxWidth: 420 }}>
              <label>One thing {data.name || 'your kid'} absolutely loves</label>
              <input className="input" placeholder="Dinosaurs, biryani, the neighbour’s cat…" value={data.loves} onChange={(e) => setData('loves', e.target.value)} />
            </div>
            <div className="field">
              <label>What you’re dreaming of</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={`chip-toggle ${data.goals.includes(g.key) ? 'picked' : ''}`}
                    onClick={() => toggleGoal(g.key)}
                  >
                    <span>{g.emoji}</span>{g.label}
                    {data.goals.includes(g.key) && <span>✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', marginTop: 'var(--space-6)' }}>
            <button type="submit" className="btn btn-primary" disabled={processing || !isDirty}>
              {processing ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="tag tag-neutral" style={{ fontSize: 13 }}>✓ Saved!</span>
            )}
            {!saved && !isDirty && (
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-neutral-500)' }}>Everything is up to date.</span>
            )}
          </div>
        </form>
      </div>
    </Shell>
  )
}
