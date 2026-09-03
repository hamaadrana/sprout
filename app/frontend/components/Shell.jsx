import { Link, usePage } from '@inertiajs/react'
import { childEmoji } from '../lib/flair'

const LINKS = [
  ['Today', '/today'],
  ['Skills', '/skills'],
  ['Worksheets', '/worksheets'],
  ['Portfolio', '/portfolio'],
  ['Progress', '/report'],
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
          font: 'inherit', fontSize: 12.5, fontWeight: 700, color: 'var(--color-neutral-600)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        Sign out
      </button>
    </form>
  )
}

export default function Shell({ active, children }) {
  const { child, app_name } = usePage().props

  return (
    <>
      <header className="app-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', minWidth: 0 }}>
          <Link
            href="/today"
            style={{
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 21,
              color: 'var(--color-text)', textDecoration: 'none', display: 'flex',
              alignItems: 'center', gap: 6,
            }}
          >
            <span aria-hidden="true">🌱</span>{app_name}
          </Link>
          <nav className="links" style={{ flexWrap: 'wrap' }}>
            {LINKS.map(([label, href]) => (
              <Link key={href} href={href} aria-current={active === label ? 'page' : undefined}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: 13.5, fontWeight: 700, color: 'var(--color-neutral-700)', flex: 'none' }}>
          {child && (
            <Link
              href="/settings"
              title={`Edit ${child.name}’s details`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fff', border: '2px solid var(--color-neutral-200)',
                borderRadius: 999, padding: '4px 12px 4px 6px',
                color: 'inherit', textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 18 }}>{childEmoji(child)}</span>
              {child.name} · {child.age_label}
              <span aria-hidden="true" style={{ fontSize: 13 }}>⚙️</span>
            </Link>
          )}
          <SignOut />
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  )
}
