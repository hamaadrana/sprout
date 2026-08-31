import { Link, usePage } from '@inertiajs/react'

const LINKS = [
  ['Today', '/today'],
  ['Skills', '/skills'],
  ['Worksheets', '/worksheets'],
  ['Portfolio', '/portfolio'],
  ['Report', '/report'],
  ['Extras', '/activities'],
]

function SignOut() {
  const csrf = typeof document !== 'undefined'
    ? document.querySelector('meta[name="csrf-token"]')?.content || ''
    : ''
  return (
    <form method="post" action="/users/sign_out" style={{ margin: 0 }}>
      <input type="hidden" name="_method" value="delete" />
      <input type="hidden" name="authenticity_token" value={csrf} />
      <button
        type="submit"
        style={{
          font: 'inherit', fontSize: 12, color: 'var(--color-neutral-600)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        Sign out
      </button>
    </form>
  )
}

export default function Shell({ active, children }) {
  const { child } = usePage().props

  return (
    <>
      <header className="app-nav">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-6)', minWidth: 0 }}>
          <Link
            href="/today"
            style={{
              fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 19,
              color: 'var(--color-text)', textDecoration: 'none',
            }}
          >
            Tracker
          </Link>
          <nav className="links" style={{ flexWrap: 'wrap' }}>
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href} aria-current={active === label ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 13, color: 'var(--color-neutral-600)', flex: 'none' }}>
          {child && <span>{child.name} · {child.age_label}</span>}
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-neutral-300)' }} />
          <SignOut />
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  )
}
