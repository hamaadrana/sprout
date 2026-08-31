export default function Landing() {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', background: 'var(--color-bg)' }}>
      <div style={{ padding: 'var(--space-3) var(--space-6)', borderBottom: '3px solid var(--color-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 20 }}>Tracker</span>
        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', fontSize: 14 }}>
          <a href="#how" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>How it works</a>
          <a href="#curriculum" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Curriculum</a>
          <a href="/users/sign_in" style={{ color: 'var(--color-text)' }}>Sign in</a>
          <a href="/users/sign_up" className="btn btn-primary">Start free</a>
        </div>
      </div>
      <div style={{ borderTop: '1px solid var(--color-text)', padding: 'var(--space-2) var(--space-6)', display: 'flex', justifyContent: 'space-between', font: '11px ui-monospace, Menlo, monospace', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-neutral-700)' }}>
        <span>For parents in Lahore, Karachi, Islamabad</span>
        <span>Ages 3–6</span>
      </div>

      <div style={{ padding: 'var(--space-8)', display: 'grid', gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(240px, 1fr)', gap: 'var(--space-8)', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: '0 0 var(--space-4)' }}>
            Know she’s ready before the admission test.
          </h1>
          <p style={{ margin: '0 0 var(--space-6)', fontSize: 18, lineHeight: 1.5, color: 'var(--color-neutral-800)', maxWidth: '46ch' }}>
            Fifteen minutes a day at your kitchen table, sequenced against Pakistan’s
            national early-years curriculum. We tell you what to teach; you teach it.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="/users/sign_up" className="btn btn-primary" style={{ fontSize: 17, padding: 'var(--space-3) var(--space-6)' }}>
              Start free
            </a>
            <span style={{ fontSize: 14, color: 'var(--color-neutral-700)' }}>No card. Takes a minute to set up.</span>
          </div>
        </div>
        <div style={{ border: '1px dashed var(--color-neutral-400)', aspectRatio: '4 / 3', display: 'grid', placeItems: 'center', font: '11px ui-monospace, Menlo, monospace', color: 'var(--color-neutral-600)', textAlign: 'center', padding: 'var(--space-4)' }}>
          A MOTHER AND CHILD AT A TABLE,<br />TEN MINUTES, REAL BUTTONS
        </div>
      </div>

      <div id="how" style={{ padding: '0 var(--space-8) var(--space-8)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-8)' }}>
        <div>
          <div className="n">01</div>
          <h3 style={{ fontSize: 20, margin: 'var(--space-2) 0 var(--space-2)' }}>Today is decided for you</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
            Two activities, the materials you already own, ten minutes each.
          </p>
        </div>
        <div>
          <div className="n">02</div>
          <h3 style={{ fontSize: 20, margin: 'var(--space-2) 0 var(--space-2)' }}>Worksheets on demand</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
            Printed at the shop down the road, generated fresh every time.
          </p>
        </div>
        <div id="curriculum">
          <div className="n">03</div>
          <h3 style={{ fontSize: 20, margin: 'var(--space-2) 0 var(--space-2)' }}>A record that holds up</h3>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--color-neutral-800)' }}>
            Every skill mapped to a national curriculum outcome, with photos of her work.
          </p>
        </div>
      </div>
    </div>
  )
}
