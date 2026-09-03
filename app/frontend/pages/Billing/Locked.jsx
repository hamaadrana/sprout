import { usePage } from '@inertiajs/react'

// Renders in place of EVERY page (application_controller.rb enforces this
// server-side) once a trial ends without payment. There is deliberately no
// navigation, no close button, and no way to reach any other route except
// signing out — the whole point is that it cannot be dismissed.
export default function Locked({ whatsapp_number, nayapay_number, monthly_price }) {
  const { app_name, auth } = usePage().props
  const csrf = typeof document !== 'undefined'
    ? document.querySelector('meta[name="csrf-token"]')?.content || ''
    : ''

  const waMessage = encodeURIComponent(
    `Hi! I've paid Rs ${monthly_price} for ${app_name} (${auth?.email || 'my account'}) — sending the screenshot now.`
  )
  const waLink = `https://wa.me/${whatsapp_number}?text=${waMessage}`

  return (
    <main
      style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        padding: 'var(--space-4)', background: 'var(--color-bg)',
      }}
    >
      <div className="card-panel card-enter" style={{ width: '100%', maxWidth: 460, padding: 'var(--space-8)', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🌱⏸️</div>
        <h1 style={{ fontSize: 28, margin: 'var(--space-3) 0 var(--space-2)' }}>
          Your free trial has ended
        </h1>
        <p style={{ color: 'var(--color-neutral-700)', fontWeight: 600, margin: '0 0 var(--space-6)' }}>
          We hope {app_name} has been useful! Keep the plan, worksheets and progress
          going for just <strong>Rs {monthly_price} / month</strong>.
        </p>

        <div style={{ background: 'var(--color-sunshine-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'left' }}>
          <div className="n" style={{ marginBottom: 6 }}>How to pay</div>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14.5, fontWeight: 600 }}>
            <li>
              Send Rs {monthly_price} via <strong>NayaPay</strong> to{' '}
              <span style={{ fontFamily: 'ui-monospace, monospace', background: '#fff', padding: '1px 6px', borderRadius: 6 }}>
                {nayapay_number}
              </span>
            </li>
            <li>Take a screenshot of the payment</li>
            <li>Send it to us on WhatsApp — we'll turn your account back on</li>
          </ol>
        </div>

        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary btn-block"
          style={{ marginTop: 'var(--space-4)', fontSize: 16 }}
        >
          💬 Message us on WhatsApp
        </a>

        <p style={{ fontSize: 12.5, color: 'var(--color-neutral-500)', marginTop: 'var(--space-4)' }}>
          Usually switched back on within a few hours.
        </p>

        <form method="post" action="/users/sign_out" style={{ marginTop: 'var(--space-6)' }}>
          <input type="hidden" name="_method" value="delete" />
          <input type="hidden" name="authenticity_token" value={csrf} />
          <button
            type="submit"
            style={{ font: 'inherit', fontSize: 13, fontWeight: 700, color: 'var(--color-neutral-500)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
