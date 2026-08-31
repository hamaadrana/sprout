import { Link, useForm } from '@inertiajs/react'
import { useRef } from 'react'
import Shell from '../components/Shell'

const MINUTE_OPTIONS = ['5', '10', '15', '20+']

export default function Log({ plan_item }) {
  const fileRef = useRef(null)
  const { data, setData, post, processing } = useForm({
    outcome: null,
    minutes: null,
    note: '',
    photo: null,
  })

  const save = (e) => {
    e.preventDefault()
    if (!data.outcome) return
    post(`/plan_items/${plan_item.id}/log`, { forceFormData: !!data.photo })
  }

  const outcomeButton = (value, label) => {
    const selected = data.outcome === value
    return (
      <button
        type="button"
        onClick={() => setData('outcome', value)}
        className={`btn ${selected ? 'btn-primary' : 'btn-secondary'}`}
        style={{ padding: 'var(--space-6) var(--space-4)', fontSize: 18 }}
        aria-pressed={selected}
      >
        {label}
      </button>
    )
  }

  return (
    <Shell active="Today">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div className="n">Logging · activity {plan_item.position}</div>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: 'var(--space-2) 0 var(--space-6)' }}>
          How did “{plan_item.skill_title.toLowerCase()}” go?
        </h1>

        <form onSubmit={save}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {outcomeButton('got_it', 'Got it')}
            {outcomeButton('needs_practice', 'Needs practice')}
          </div>
          <p style={{ margin: 'var(--space-3) 0 var(--space-6)', fontSize: 13, color: 'var(--color-neutral-600)' }}>
            Two “got it” in a row marks the skill mastered. “Needs practice” keeps it in
            tomorrow’s plan.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="field">
              <label>Minutes <span style={{ color: 'var(--color-neutral-600)' }}>(optional)</span></label>
              <div className="seg">
                {MINUTE_OPTIONS.map((m) => (
                  <label key={m} className="seg-opt">
                    <input
                      type="radio"
                      name="mins"
                      checked={data.minutes === m}
                      onChange={() => setData('minutes', m)}
                    />
                    {m}
                  </label>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Note <span style={{ color: 'var(--color-neutral-600)' }}>(optional)</span></label>
              <input
                className="input"
                placeholder="Skipped 7 and 8 both times"
                value={data.note}
                onChange={(e) => setData('note', e.target.value)}
              />
            </div>

            <label
              style={{
                border: '1px dashed var(--color-neutral-400)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)', textAlign: 'center', cursor: 'pointer',
                color: 'var(--color-neutral-600)', font: '12px ui-monospace, Menlo, monospace',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              {data.photo ? `Photo attached: ${data.photo.name}` : 'Add a photo of her work → portfolio'}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setData('photo', e.target.files[0] || null)}
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', alignItems: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={!data.outcome || processing}>
              {processing ? 'Saving…' : 'Save'}
            </button>
            <Link href="/today" className="btn btn-ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </Shell>
  )
}
