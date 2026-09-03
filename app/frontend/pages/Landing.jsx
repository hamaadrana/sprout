import { usePage } from '@inertiajs/react'

const STEPS = [
  {
    emoji: '👋', color: 'var(--color-sunshine-100)', title: '1 · Tell us about your kid',
    body: 'Two minutes: their age, what they already know, what they’re like. Counts to ten already? We skip it.',
  },
  {
    emoji: '🗓️', color: 'var(--color-sky-100)', title: '2 · We hand you today',
    body: 'Open the app, and today is decided: two tiny activities, ~15 minutes, using things already in your kitchen.',
  },
  {
    emoji: '🙌', color: 'var(--color-green-100)', title: '3 · Teach, then tap',
    body: 'Play the game, do the worksheet, then tap “Got it” or “Needs practice”. That one tap plans tomorrow.',
  },
  {
    emoji: '🌟', color: 'var(--color-pink-100)', title: '4 · Watch it add up',
    body: 'Streaks, skills mastered, photos of their work — and a report mapped to Pakistan’s national curriculum.',
  },
]

const FLOATERS = [
  ['🔢', '6%', '12%'], ['✏️', '85%', '8%'], ['📖', '92%', '55%'], ['🎨', '3%', '68%'],
  ['🧩', '78%', '80%'], ['⭐', '55%', '4%'],
]

export default function Landing() {
  const { app_name, tagline } = usePage().props

  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 var(--space-4)' }}>
        <div style={{ padding: 'var(--space-3) 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🌱</span>{app_name}
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', fontSize: 14.5, fontWeight: 700 }}>
            <a href="#how" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>How it works</a>
            <a href="#who" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>Who it’s for</a>
            <a href="/users/sign_in" style={{ color: 'var(--color-text)' }}>Sign in</a>
            <a href="/users/sign_up" className="btn btn-primary">Start free</a>
          </div>
        </div>

        {/* hero */}
        <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-8) 0 var(--space-6)' }}>
          {FLOATERS.map(([emoji, left, top], i) => (
            <span
              key={i}
              className="float-slow"
              aria-hidden="true"
              style={{
                position: 'absolute', left, top, fontSize: 34, opacity: 0.85,
                animationDelay: `${i * 0.6}s`, pointerEvents: 'none',
              }}
            >
              {emoji}
            </span>
          ))}
          <div className="tag tag-accent-2" style={{ fontSize: 13 }}>For parents of 3–6 year olds in Pakistan 🇵🇰</div>
          <h1 style={{ fontSize: 'clamp(38px, 6vw, 62px)', lineHeight: 1.05, margin: 'var(--space-4) auto var(--space-3)', maxWidth: '17ch' }}>
            15 minutes a day.<br />
            <span style={{ color: 'var(--color-accent)' }}>A kid who’s ready.</span>
          </h1>
          <p style={{ fontSize: 18.5, lineHeight: 1.55, color: 'var(--color-neutral-700)', maxWidth: '48ch', margin: '0 auto var(--space-6)', fontWeight: 600 }}>
            {app_name} tells you exactly what to teach your little one today — games, chats
            and printable worksheets, sequenced against Pakistan’s national early-years
            curriculum. You bring the biscuits; we bring the plan.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/users/sign_up" className="btn btn-primary" style={{ fontSize: 18, padding: '14px 34px' }}>
              Start free — it takes a minute
            </a>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-neutral-600)' }}>No card needed. {tagline}</span>
          </div>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--color-neutral-500)', marginTop: 'var(--space-3)' }}>
            🎁 Free for 3 days. Loved it? It's just Rs 100/month after — pay only if you keep using it.
          </p>
        </div>

        {/* how it works */}
        <div id="how" style={{ padding: 'var(--space-8) 0' }}>
          <h2 style={{ textAlign: 'center', fontSize: 34 }}>How it works 🧭</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-neutral-600)', fontWeight: 600, margin: '0 0 var(--space-6)' }}>
            No lesson planning. No “what should we do today?”. Ever.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="stat-tile" style={{ padding: 'var(--space-6) var(--space-4)' }}>
                <span className="emoji-badge" style={{ background: step.color, width: 56, height: 56, fontSize: 30 }}>{step.emoji}</span>
                <h3 style={{ fontSize: 19, margin: 'var(--space-3) 0 var(--space-1)' }}>{step.title}</h3>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: 'var(--color-neutral-700)' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* who it's for */}
        <div id="who" style={{ padding: 'var(--space-6) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card-panel" style={{ padding: 'var(--space-6)', borderColor: 'var(--color-accent-2-300)' }}>
            <div style={{ fontSize: 38 }}>🎒</div>
            <h3 style={{ fontSize: 22, margin: 'var(--space-2) 0' }}>The admission is coming</h3>
            <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', margin: 0 }}>
              School interviews at 5 ask real questions. {app_name} shows exactly which
              readiness outcomes are met, which are close, and how many months you have —
              so you walk in knowing, not hoping.
            </p>
          </div>
          <div className="card-panel" style={{ padding: 'var(--space-6)', borderColor: 'var(--color-green)' }}>
            <div style={{ fontSize: 38 }}>🏡</div>
            <h3 style={{ fontSize: 22, margin: 'var(--space-2) 0' }}>You’re the teacher</h3>
            <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', margin: 0 }}>
              Homeschooling the early years? You get the full curriculum map — every strand,
              every skill, in the right order — plus a portfolio of their real work that
              holds up anywhere.
            </p>
          </div>
        </div>

        {/* credibility + what's inside */}
        <div style={{ padding: 'var(--space-6) 0 var(--space-8)' }}>
          <div
            className="card-panel"
            style={{ padding: 'var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}
          >
            {[
              ['📚', 'Two subjects, one plan', 'Numeracy and English with phonics — 60+ skills across nine strands, and growing.'],
              ['🇵🇰', 'The real curriculum', 'Every skill maps to SLO codes from the National Curriculum of Pakistan 2022-23 (ECE).'],
              ['📝', 'Worksheets on demand', 'Generated fresh with your child’s name on them. Print at home or the photocopy shop.'],
              ['🎨', '150+ extras', 'Rainy-day activities and make-it crafts — Eid cards, bean sprouts, salt dough — by age.'],
            ].map(([emoji, title, body], i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 26 }}>{emoji}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>{title}</div>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'var(--color-neutral-700)' }}>{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
            <h2 style={{ fontSize: 30 }}>Today’s plan is waiting 🌱</h2>
            <a href="/users/sign_up" className="btn btn-primary" style={{ fontSize: 18, padding: '14px 34px', marginTop: 'var(--space-2)' }}>
              Start free
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
