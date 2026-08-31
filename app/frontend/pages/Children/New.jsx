import { useForm } from '@inertiajs/react'

export default function NewChild({ errors = {} }) {
  const { data, setData, post, processing } = useForm({
    name: '',
    date_of_birth: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/child')
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card-enter">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-pine-deep">
            Who are we teaching?
          </h1>
          <p className="text-ink-soft mt-2">
            One child to start with. The plan adapts to their age.
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-sage-line bg-white p-6 shadow-sm space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink-soft mb-1">
              Child’s name
            </label>
            <input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-sage-line bg-white px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-pine/40 focus:border-pine"
            />
            {errors.name && <p className="mt-1 text-sm text-clay">{errors.name[0]}</p>}
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-ink-soft mb-1">
              Date of birth
            </label>
            <input
              id="date_of_birth"
              type="date"
              value={data.date_of_birth}
              onChange={(e) => setData('date_of_birth', e.target.value)}
              className="w-full rounded-lg border border-sage-line bg-white px-3 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-pine/40 focus:border-pine"
            />
            {errors.date_of_birth && (
              <p className="mt-1 text-sm text-clay">{errors.date_of_birth[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={processing || !data.name || !data.date_of_birth}
            className="w-full rounded-xl bg-pine py-3 font-bold text-paper transition-colors hover:bg-pine-deep disabled:opacity-50 cursor-pointer"
          >
            {processing ? 'Setting up…' : 'Start the plan'}
          </button>
        </form>
      </div>
    </main>
  )
}
