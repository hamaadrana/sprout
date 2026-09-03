import { router, useForm, usePage } from '@inertiajs/react'
import { useRef, useState } from 'react'
import Shell from '../../components/Shell'

function UploadPanel({ skills, errors, onDone }) {
  const fileRef = useRef(null)
  const { data, setData, post, processing, reset } = useForm({
    image: null,
    caption: '',
    skill_id: '',
    taken_on: new Date().toISOString().slice(0, 10),
  })

  const submit = (e) => {
    e.preventDefault()
    post('/portfolio', {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        reset()
        if (fileRef.current) fileRef.current.value = ''
        onDone()
      },
    })
  }

  return (
    <form
      onSubmit={submit}
      style={{ background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div style={{ gridColumn: '1 / -1' }} className="field">
          <label>Photo</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="input"
            style={{ paddingTop: 5 }}
            onChange={(e) => setData('image', e.target.files[0] || null)}
          />
          {errors?.image && <p style={{ color: 'var(--color-accent-2-700)', fontSize: 13, margin: '4px 0 0' }}>{errors.image[0]}</p>}
        </div>
        <div className="field">
          <label>Caption <span style={{ color: 'var(--color-neutral-600)' }}>(optional)</span></label>
          <input className="input" value={data.caption} onChange={(e) => setData('caption', e.target.value)} />
        </div>
        <div className="field">
          <label>Skill tag <span style={{ color: 'var(--color-neutral-600)' }}>(optional)</span></label>
          <select className="input" value={data.skill_id} onChange={(e) => setData('skill_id', e.target.value)}>
            <option value="">No skill tag</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Date</label>
          <input className="input" type="date" value={data.taken_on} onChange={(e) => setData('taken_on', e.target.value)} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="submit" className="btn btn-primary btn-block" disabled={processing || !data.image}>
            {processing ? 'Saving…' : 'Add to portfolio'}
          </button>
        </div>
      </div>
    </form>
  )
}

function Piece({ item }) {
  const [confirming, setConfirming] = useState(false)
  const remove = () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    router.delete(`/portfolio/${item.id}`, { preserveScroll: true })
  }
  const dateLabel = new Date(`${item.taken_on}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div>
      <a href={item.full_url} target="_blank" rel="noreferrer">
        <img
          src={item.thumb_url}
          alt={item.caption || 'Portfolio piece'}
          loading="lazy"
          style={{ aspectRatio: 1, width: '100%', objectFit: 'cover', boxShadow: 'var(--shadow-sm)' }}
        />
      </a>
      <div style={{ fontSize: 13, marginTop: 'var(--space-2)' }}>{item.caption || 'Untitled'}</div>
      <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', display: 'flex', justifyContent: 'space-between', gap: 4 }}>
        <span>{dateLabel}{item.skill_code ? ` · ${item.skill_code}` : ' · untagged'}</span>
        <button
          onClick={remove}
          style={{ font: 'inherit', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer', color: confirming ? 'var(--color-accent-2-700)' : 'var(--color-neutral-500)', padding: 0 }}
        >
          {confirming ? 'confirm' : 'remove'}
        </button>
      </div>
    </div>
  )
}

export default function PortfolioIndex({ months, skills, total_count, errors }) {
  const { child } = usePage().props
  const [uploading, setUploading] = useState(false)

  return (
    <Shell active="Portfolio">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <div className="n">Portfolio · {total_count} piece{total_count === 1 ? '' : 's'}</div>
          <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 0' }}>{child?.name}’s work</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setUploading(!uploading)}>
          {uploading ? 'Close' : 'Add photos'}
        </button>
      </div>

      {(uploading || months.length === 0) && (
        <UploadPanel skills={skills} errors={errors} onDone={() => setUploading(false)} />
      )}

      {months.length === 0 ? (
        <p style={{ marginTop: 'var(--space-6)', color: 'var(--color-neutral-600)' }}>
          Nothing here yet. Photograph today’s worksheet or craft and add it.
        </p>
      ) : (
        months.map((month) => (
          <section key={month.label} style={{ marginTop: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 18, margin: '0 0 var(--space-3)' }}>
              {month.label}{' '}
              <span style={{ color: 'var(--color-neutral-600)', fontWeight: 400 }}>
                · {month.items.length} piece{month.items.length === 1 ? '' : 's'}
              </span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 'var(--space-4)' }}>
              {month.items.map((item) => <Piece key={item.id} item={item} />)}
            </div>
          </section>
        ))
      )}
    </Shell>
  )
}
