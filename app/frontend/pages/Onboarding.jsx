import { useForm, usePage } from '@inertiajs/react'
import { useState } from 'react'
import { GOALS, PERSONALITIES } from '../lib/childOptions'

const HEAD_START = [
  { key: 'counts_to_10', emoji: '🔟', label: 'Counts to 10 out loud' },
  { key: 'counts_objects', emoji: '👆', label: 'Counts things one by one' },
  { key: 'knows_numbers_to_5', emoji: '5️⃣', label: 'Recognises numbers 1–5' },
  { key: 'knows_shapes', emoji: '🔺', label: 'Knows circle, square, triangle' },
  { key: 'sings_rhymes', emoji: '🎵', label: 'Sings along with rhymes' },
  { key: 'full_sentences', emoji: '💬', label: 'Talks in full sentences' },
  { key: 'knows_some_letters', emoji: '🅰️', label: 'Knows some ABC letters' },
  { key: 'knows_most_letters', emoji: '🔤', label: 'Knows most of the alphabet' },
  { key: 'holds_pencil', emoji: '✏️', label: 'Holds a pencil nicely' },
  { key: 'knows_colours', emoji: '🌈', label: 'Knows the main colours' },
  { key: 'knows_body_parts', emoji: '🙆', label: 'Names body parts' },
  { key: 'says_name_age', emoji: '🎤', label: 'Says their name and age' },
  { key: 'dresses_self', emoji: '👕', label: 'Gets dressed alone' },
  { key: 'uses_scissors', emoji: '✂️', label: 'Cuts with child scissors' },
]

const TOTAL_STEPS = 5

export default function Onboarding({ errors = {} }) {
  const { app_name } = usePage().props
  const [step, setStep] = useState(1)
  const { data, setData, post, processing, transform } = useForm({
    name: '',
    date_of_birth: '',
    gender: null,
    personality: null,
    loves: '',
    head_start: [],
    framing: null,
    target_school_start_on: '',
    goals: [],
  })

  transform((d) => ({
    child: {
      name: d.name,
      date_of_birth: d.date_of_birth,
      gender: d.gender,
      framing: d.framing || 'readiness',
      target_school_start_on: d.framing === 'readiness' ? d.target_school_start_on || null : null,
      traits: { personality: d.personality, loves: d.loves },
      goals: d.goals,
      head_start: d.head_start,
    },
  }))

  const toggle = (field, key) =>
    setData(field, data[field].includes(key) ? data[field].filter((k) => k !== key) : [...data[field], key])

  const stepValid = {
    1: data.name.trim() !== '' && data.date_of_birth !== '' && data.gender !== null,
    2: data.personality !== null,
    3: true,
    4: data.framing !== null,
    5: true,
  }[step]

  const kidName = data.name.trim() || 'your little one'
  const pronounObj = data.gender === 'boy' ? 'him' : data.gender === 'girl' ? 'her' : 'them'

  const header = (kicker, title, sub) => (
    <>
      <div className="n">{kicker}</div>
      <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: 'var(--space-2) 0 var(--space-2)' }}>{title}</h1>
      {sub && <p style={{ color: 'var(--color-neutral-700)', margin: '0 0 var(--space-6)' }}>{sub}</p>}
    </>
  )

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-4)' }}>
      <div className="card-panel card-enter" style={{ width: '100%', maxWidth: 780, padding: 'var(--space-8)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', alignItems: 'center' }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              style={{
                flex: 1, height: 8, borderRadius: 999,
                background: n <= step ? 'var(--color-accent)' : 'var(--color-neutral-200)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-neutral-500)', flex: 'none' }}>
            {step}/{TOTAL_STEPS}
          </span>
        </div>

        {step === 1 && (
          <>
            {header(`Welcome to ${app_name} 🌱`, 'Who’s the star of the show?', 'Ten seconds of paperwork, promise. Then it’s all play.')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="field">
                <label>Name</label>
                <input className="input" autoFocus value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ayesha, Hassan, …" />
                {errors.name && <p style={{ color: 'var(--color-accent-600)', fontSize: 13, margin: '4px 0 0' }}>{errors.name[0]}</p>}
              </div>
              <div className="field">
                <label>Birthday</label>
                <input className="input" type="date" value={data.date_of_birth} onChange={(e) => setData('date_of_birth', e.target.value)} />
                {errors.date_of_birth && <p style={{ color: 'var(--color-accent-600)', fontSize: 13, margin: '4px 0 0' }}>{errors.date_of_birth[0]}</p>}
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
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: 'auto', padding: '12px 22px' }}
                >
                  <span style={{ fontSize: 28 }}>{emoji}</span>
                  <span style={{ fontWeight: 800 }}>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {header('The fun part', `What’s ${kidName} like?`, 'No wrong answers — this just helps us talk about the same kid you know.')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              {PERSONALITIES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="pick-card"
                  aria-pressed={data.personality === p.key}
                  onClick={() => setData('personality', p.key)}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
                >
                  <span style={{ fontSize: 30 }}>{p.emoji}</span>
                  <span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>{p.title}</span>
                    <span style={{ fontSize: 13.5, color: 'var(--color-neutral-700)' }}>{p.body}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="field" style={{ marginTop: 'var(--space-4)', maxWidth: 420 }}>
              <label>One thing {kidName} absolutely loves <span style={{ color: 'var(--color-neutral-500)' }}>(optional)</span></label>
              <input className="input" placeholder="Dinosaurs, biryani, the neighbour’s cat…" value={data.loves} onChange={(e) => setData('loves', e.target.value)} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {header('Head start', `What can ${kidName} already do?`, `Tick everything that’s true — we’ll skip past it and start ${pronounObj} where the fun begins.`)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {HEAD_START.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`chip-toggle ${data.head_start.includes(item.key) ? 'picked' : ''}`}
                  onClick={() => toggle('head_start', item.key)}
                >
                  <span>{item.emoji}</span>{item.label}
                  {data.head_start.includes(item.key) && <span>✓</span>}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--color-neutral-600)', margin: 'var(--space-4) 0 0' }}>
              Not sure about one? Leave it — the plan will check gently and adjust.
            </p>
          </>
        )}

        {step === 4 && (
          <>
            {header('Your reason', 'What brings you here?', 'Same plan either way — but the app talks about progress your way.')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
              <button
                type="button"
                className="pick-card"
                aria-pressed={data.framing === 'readiness'}
                onClick={() => setData('framing', 'readiness')}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 30 }}>🎒</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>Getting ready for school</span>
                  <span style={{ fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
                    Admission is coming. You’ll see readiness against the national curriculum, with a countdown.
                  </span>
                </span>
              </button>
              <button
                type="button"
                className="pick-card"
                aria-pressed={data.framing === 'coverage'}
                onClick={() => setData('framing', 'coverage')}
                style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}
              >
                <span style={{ fontSize: 30 }}>🏡</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>Learning at home</span>
                  <span style={{ fontSize: 13.5, color: 'var(--color-neutral-700)' }}>
                    You’re the teacher. You’ll see what’s covered and what’s next across the whole curriculum.
                  </span>
                </span>
              </button>
            </div>
            {data.framing === 'readiness' && (
              <div className="field" style={{ marginTop: 'var(--space-4)', maxWidth: 300 }}>
                <label>When should school start? <span style={{ color: 'var(--color-neutral-500)' }}>(optional)</span></label>
                <input
                  className="input"
                  type="month"
                  value={data.target_school_start_on?.slice(0, 7) || ''}
                  onChange={(e) => setData('target_school_start_on', e.target.value ? `${e.target.value}-01` : '')}
                />
              </div>
            )}
          </>
        )}

        {step === 5 && (
          <>
            {header('Nearly there', 'What are you dreaming of?', `Pick as many as you like — we’ll cheer the loudest for these.`)}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {GOALS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  className={`chip-toggle ${data.goals.includes(g.key) ? 'picked' : ''}`}
                  onClick={() => toggle('goals', g.key)}
                >
                  <span>{g.emoji}</span>{g.label}
                  {data.goals.includes(g.key) && <span>✓</span>}
                </button>
              ))}
            </div>
            <div
              style={{
                marginTop: 'var(--space-6)', padding: 'var(--space-4)',
                background: 'var(--color-sunshine-100)', borderRadius: 'var(--radius-lg)',
                display: 'flex', gap: 12, alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 34 }} className="float-slow">🎉</span>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {kidName}’s plan is ready: two tiny activities a day, about 15 minutes,
                built on Pakistan’s national early-years curriculum
                {data.head_start.length > 0 && <> — starting past the {data.head_start.length} thing{data.head_start.length === 1 ? '' : 's'} already conquered</>}.
              </p>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          {step < TOTAL_STEPS ? (
            <button className="btn btn-primary" disabled={!stepValid} onClick={() => setStep(step + 1)}>
              Continue →
            </button>
          ) : (
            <button className="btn btn-primary" disabled={processing} onClick={() => post('/child')}>
              {processing ? 'Setting up…' : `Let’s go! 🚀`}
            </button>
          )}
          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button>
          )}
        </div>
      </div>
    </main>
  )
}
