import { router } from '@inertiajs/react'
import { useState } from 'react'

const STATUS_META = {
  admin: { label: 'admin', className: 'tag tag-neutral' },
  trial: { label: 'trial', className: 'tag tag-accent' },
  paid: { label: 'paid', className: 'tag tag-neutral' },
  locked: { label: 'locked', className: 'tag tag-accent-2' },
  expired: { label: 'expired', className: 'tag tag-outline' },
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function UserRow({ user }) {
  const [busy, setBusy] = useState(false)
  const status = STATUS_META[user.access_status] || STATUS_META.expired

  const act = (path) => {
    setBusy(true)
    router.post(path, {}, { preserveScroll: true, onFinish: () => setBusy(false) })
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--color-neutral-100)' }}>
      <td style={{ padding: '10px 12px' }}>
        <div style={{ fontWeight: 800 }}>{user.name || '—'}</div>
        <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>{user.email}</div>
      </td>
      <td style={{ padding: '10px 12px' }}>
        {user.child_name ? (
          <>
            <div style={{ fontWeight: 700 }}>{user.child_name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--color-neutral-500)' }}>
              {user.child_age_label} · {user.framing === 'readiness' ? '🎒 admission prep' : '🏡 homeschool'}
            </div>
          </>
        ) : (
          <span style={{ color: 'var(--color-neutral-400)' }}>no child yet</span>
        )}
      </td>
      <td style={{ padding: '10px 12px', fontSize: 13 }}>{formatDate(user.signed_up_on)}</td>
      <td style={{ padding: '10px 12px', fontSize: 13 }}>{formatDate(user.last_active_on)}</td>
      <td style={{ padding: '10px 12px' }}>
        <span className={status.className}>{status.label}</span>
        <div style={{ fontSize: 11.5, color: 'var(--color-neutral-500)', marginTop: 4 }}>
          {user.access_status === 'trial' && `ends ${formatDate(user.trial_ends_at)}`}
          {user.access_status === 'paid' && `until ${formatDate(user.access_granted_until)}`}
        </div>
      </td>
      <td style={{ padding: '10px 12px' }}>
        {!user.admin && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              disabled={busy}
              onClick={() => act(`/superadmin/users/${user.id}/mark_paid`)}
              className="btn btn-primary"
              style={{ fontSize: 12.5, padding: '6px 12px' }}
            >
              ✓ Mark paid (+1mo)
            </button>
            {user.locked_by_admin ? (
              <button
                disabled={busy}
                onClick={() => act(`/superadmin/users/${user.id}/unlock`)}
                className="btn btn-secondary"
                style={{ fontSize: 12.5, padding: '6px 12px' }}
              >
                Unlock
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => act(`/superadmin/users/${user.id}/lock`)}
                className="btn btn-secondary"
                style={{ fontSize: 12.5, padding: '6px 12px', color: 'var(--color-accent-600)' }}
              >
                🔒 Lock now
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

export default function SuperadminUsersIndex({ users, monthly_price }) {
  const counts = users.reduce((acc, u) => {
    acc[u.access_status] = (acc[u.access_status] || 0) + 1
    return acc
  }, {})

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <div className="n">Superadmin · not visible to parents</div>
      <h1 style={{ fontSize: 32, margin: 'var(--space-2) 0 var(--space-1)' }}>Everyone who's signed up</h1>
      <p style={{ color: 'var(--color-neutral-700)', fontWeight: 600, margin: '0 0 var(--space-4)' }}>
        {users.length} account{users.length === 1 ? '' : 's'} · Rs {monthly_price}/month after the 3-day trial
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([status, count]) => {
          const meta = STATUS_META[status] || STATUS_META.expired
          return (
            <span key={status} className={meta.className}>
              {count} {meta.label}
            </span>
          )
        })}
      </div>

      <div className="card-panel" style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-neutral-200)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Parent</th>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Child</th>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Signed up</th>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Last active</th>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Access</th>
              <th style={{ padding: '10px 12px', fontSize: 12, textTransform: 'uppercase', color: 'var(--color-neutral-500)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => <UserRow key={u.id} user={u} />)}
          </tbody>
        </table>
      </div>
    </main>
  )
}
