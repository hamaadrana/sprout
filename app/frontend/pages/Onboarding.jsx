import { useForm } from '@inertiajs/react'
import { useState } from 'react'

export default function Onboarding({ errors = {} }) {
  const [step, setStep] = useState(1)
  const { data, setData, post, processing, transform } = useForm({
    name: '',
    date_of_birth: '',
    framing: 'readiness',
    target_school_start_on: '',
  })

  transform((d) => ({
    child: {
      name: d.name,
      date_of_birth: d.date_of_birth,
      framing: d.framing,
      target_school_start_on: d.framing === 'readiness' ? d.target_school_start_on || null : null,
    },
  }))

  const submit = () => post('/child')

  const stepValid =
    step === 1 ? data.name.trim() !== '' && data.date_of_birth !== '' : true

  const framingOption = (value, title, body) => {
    const selected = data.framing === value
    return (
      <div
        onClick={() => setData('framing', value)}
        style={{
          padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
          background: selected ? 'var(--color-accent-100)' : 'var(--color-neutral-100)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'baseline' }}>
          <label className="radio">
            <input
              type="radio"
              name="framing-onboard"
              checked={selected}
              onChange={() => setData('framing', value)}
            />
            <span className="dot"></span>
          </label>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19 }}>{title}</div>
            <p style={{ margin: 'var(--space-1) 0 0', fontSize: 14, color: 'var(--color-neutral-700)' }}>{body}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 'var(--space-4)' }}>
      <div style={{ width: '100%', maxWidth: 760, background: 'var(--color-bg)', padding: 'var(--space-8)' }} className="elev-md">
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          {[ 1, 2, 3 ].map((n) => (
            <div key={n} style={{ width: 60, height: 4, background: n <= step ? 'var(--color-accent)' : 'var(--color-neutral-300)' }} />
          ))}
        </div>
        <div className="n">Step {step} of 3</div>

        {step === 1 && (
          <>
            <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: 'var(--space-2) 0 var(--space-6)' }}>
              Who are we teaching?
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div className="field">
                <label>Her name</label>
                <input
                  className="input"
                  autoFocus
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                {errors.name && <p style={{ color: 'var(--color-accent-2-700)', fontSize: 13, margin: '4px 0 0' }}>{errors.name[0]}</p>}
              </div>
              <div className="field">
                <label>Date of birth</label>
                <input
                  className="input"
                  type="date"
                  value={data.date_of_birth}
                  onChange={(e) => setData('date_of_birth', e.target.value)}
                />
                {errors.date_of_birth && <p style={{ color: 'var(--color-accent-2-700)', fontSize: 13, margin: '4px 0 0' }}>{errors.date_of_birth[0]}</p>}
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 'var(--space-4) 0 0' }}>
              The plan adapts to her age. One child to start with.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: 'var(--space-2) 0 var(--space-6)' }}>
              What matters most to you right now?
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {framingOption(
                'readiness',
                'Getting her ready for school',
                'Progress shown against admission readiness, with a countdown to her start date.'
              )}
              {framingOption(
                'coverage',
                'Teaching her at home',
                'Progress shown as what’s covered and what’s left across the curriculum.'
              )}
            </div>
            {data.framing === 'readiness' && (
              <div className="field" style={{ marginTop: 'var(--space-4)', maxWidth: 300 }}>
                <label>When should she start school? <span style={{ color: 'var(--color-neutral-600)' }}>(optional)</span></label>
                <input
                  className="input"
                  type="month"
                  value={data.target_school_start_on?.slice(0, 7) || ''}
                  onChange={(e) => setData('target_school_start_on', e.target.value ? `${e.target.value}-01` : '')}
                />
              </div>
            )}
            <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 'var(--space-4) 0 0' }}>
              You can change this later. Either way it’s the same plan — only the report reads
              differently.
            </p>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: 'var(--space-2) 0 var(--space-6)' }}>
              {data.name}’s plan is ready
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-neutral-800)', maxWidth: '52ch' }}>
              Two short activities a day, sequenced against Pakistan’s national early-years
              curriculum. Materials you already own. Tomorrow picks up wherever today ends.
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          {step < 3 ? (
            <button className="btn btn-primary" disabled={!stepValid} onClick={() => setStep(step + 1)}>
              Continue
            </button>
          ) : (
            <button className="btn btn-primary" disabled={processing} onClick={submit}>
              {processing ? 'Setting up…' : 'Start the plan'}
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
