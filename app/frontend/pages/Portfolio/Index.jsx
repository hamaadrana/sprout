import { Link, router, useForm } from '@inertiajs/react'
import { useRef, useState } from 'react'

function UploadCard({ skills, errors }) {
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
      },
    })
  }

  const inputClass =
    'w-full rounded-lg border border-sage-line bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-pine/40 focus:border-pine'

  return (
    <form
      onSubmit={submit}
      className="card-enter rounded-2xl border border-sage-line bg-white p-5 shadow-sm mb-8"
    >
      <p className="font-bold text-ink mb-3">Add a piece of work</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setData('image', e.target.files[0] || null)}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-sage file:px-4 file:py-2 file:text-sm file:font-bold file:text-pine-deep file:cursor-pointer"
          />
          {errors?.image && <p className="mt-1 text-sm text-clay">{errors.image[0]}</p>}
        </div>
        <input
          type="text"
          placeholder="Caption (optional)"
          value={data.caption}
          onChange={(e) => setData('caption', e.target.value)}
          className={inputClass}
        />
        <select
          value={data.skill_id}
          onChange={(e) => setData('skill_id', e.target.value)}
          className={inputClass}
        >
          <option value="">No skill tag</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={data.taken_on}
          onChange={(e) => setData('taken_on', e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={processing || !data.image}
          className="rounded-xl bg-pine py-2.5 font-bold text-paper hover:bg-pine-deep disabled:opacity-50 cursor-pointer"
        >
          {processing ? 'Saving…' : 'Add to portfolio'}
        </button>
      </div>
    </form>
  )
}

function PhotoCard({ item }) {
  const [confirming, setConfirming] = useState(false)

  const remove = () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    router.delete(`/portfolio/${item.id}`, { preserveScroll: true })
  }

  return (
    <figure className="rounded-xl border border-sage-line bg-white overflow-hidden shadow-sm">
      <a href={item.full_url} target="_blank" rel="noreferrer">
        <img
          src={item.thumb_url}
          alt={item.caption || 'Portfolio piece'}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      </a>
      <figcaption className="px-3 py-2 text-xs">
        {item.caption && <p className="text-ink font-medium leading-snug">{item.caption}</p>}
        {item.skill_title && (
          <p className="mt-0.5 inline-block rounded-full bg-sage px-2 py-0.5 text-[11px] font-bold text-pine-deep">
            {item.skill_title}
          </p>
        )}
        <div className="mt-1 flex items-center justify-between text-ink-soft">
          <span>{new Date(`${item.taken_on}T00:00:00`).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</span>
          <button
            onClick={remove}
            className={`cursor-pointer font-bold ${confirming ? 'text-clay' : 'text-ink-soft/60 hover:text-clay'}`}
          >
            {confirming ? 'Tap to confirm' : 'Remove'}
          </button>
        </div>
      </figcaption>
    </figure>
  )
}

export default function PortfolioIndex({ months, skills, errors }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <Link href="/" className="text-xs font-bold uppercase tracking-[0.18em] text-ink-soft hover:text-pine">
          ← Today
        </Link>
        <h1 className="font-display text-4xl font-bold text-pine-deep mt-1">Portfolio</h1>
        <p className="text-ink-soft mt-1 text-sm">
          Photos of finished work — the record that shows how far she’s come.
        </p>
      </header>

      <UploadCard skills={skills} errors={errors} />

      {months.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sage-line bg-white/50 px-6 py-10 text-center text-ink-soft">
          Nothing here yet. Photograph today’s worksheet or craft and add it.
        </div>
      ) : (
        months.map((month) => (
          <section key={month.label} className="mb-8">
            <h2 className="font-display text-xl font-semibold text-pine-deep mb-3">{month.label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {month.items.map((item) => (
                <PhotoCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
