import { router } from '@inertiajs/react'
import { useState } from 'react'
import Shell from '../../components/Shell'

const MESS_TAGS = {
  low: 'tag tag-neutral',
  medium: 'tag tag-accent',
  high: 'tag tag-accent-2',
}

function ActivityCard({ activity }) {
  return (
    <div style={{ background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>{activity.title}</div>
        <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', flex: 'none' }}>{activity.duration_minutes} min</span>
      </div>
      <div style={{ display: 'flex', gap: 6, margin: '6px 0', flexWrap: 'wrap' }}>
        <span className="tag tag-outline">{activity.domain}</span>
        {activity.supervision && <span className="tag tag-accent-2">stay with her</span>}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--color-neutral-800)', margin: '0 0 var(--space-2)' }}>
        {activity.instructions}
      </p>
      {activity.variation && (
        <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', margin: 0 }}>
          <em>Variation:</em> {activity.variation}
        </p>
      )}
      {activity.materials.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 'var(--space-2)' }}>
          Needs: {activity.materials.join(' · ')}
        </div>
      )}
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <div style={{ background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', alignItems: 'baseline' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>{project.title}</div>
        <span style={{ fontSize: 12, color: 'var(--color-neutral-600)', flex: 'none' }}>{project.duration_minutes} min</span>
      </div>
      <div style={{ display: 'flex', gap: 6, margin: '6px 0', flexWrap: 'wrap' }}>
        <span className="tag tag-outline">{project.category}</span>
        <span className={MESS_TAGS[project.mess_level]}>{project.mess_level} mess</span>
        {project.occasion && <span className="tag tag-neutral">{project.occasion}</span>}
        {project.supervision && <span className="tag tag-accent-2">stay with her</span>}
      </div>
      {project.adult_prep && (
        <p style={{ fontSize: 13, color: 'var(--color-neutral-800)', margin: '0 0 var(--space-2)' }}>
          <strong>Before you call her over:</strong> {project.adult_prep}
        </p>
      )}
      <details style={{ fontSize: 14 }}>
        <summary style={{ cursor: 'pointer', color: 'var(--color-accent-700)', fontWeight: 600 }}>
          Steps and materials
        </summary>
        <ol style={{ margin: 'var(--space-2) 0', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4, color: 'var(--color-neutral-800)' }}>
          {project.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        {project.materials.length > 0 && (
          <div style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>
            Needs: {project.materials.join(' · ')}
          </div>
        )}
      </details>
      {project.portfolio && (
        <div className="n" style={{ marginTop: 'var(--space-2)' }}>Photograph it → portfolio</div>
      )}
    </div>
  )
}

export default function ExtrasIndex({ age_band, age_bands, activities, projects }) {
  const [tab, setTab] = useState('activities')
  const byDomain = activities.reduce((acc, a) => {
    ;(acc[a.domain] ||= []).push(a)
    return acc
  }, {})

  return (
    <Shell active="Extras">
      <div className="n">Extras — not on the plan, browse when you want more</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-4)' }}>
        Things to do, things to make
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="seg">
          <label className="seg-opt">
            <input type="radio" name="extras-tab" checked={tab === 'activities'} onChange={() => setTab('activities')} />
            Activities ({activities.length})
          </label>
          <label className="seg-opt">
            <input type="radio" name="extras-tab" checked={tab === 'projects'} onChange={() => setTab('projects')} />
            Make-It projects ({projects.length})
          </label>
        </div>
        <span style={{ color: 'var(--color-neutral-600)', fontSize: 14 }}>Age:</span>
        <div className="seg">
          {age_bands.map((band) => (
            <label key={band} className="seg-opt">
              <input
                type="radio"
                name="extras-age"
                checked={age_band === band}
                onChange={() => router.get('/activities', { age_band: band }, { preserveState: false })}
              />
              {band}
            </label>
          ))}
        </div>
      </div>

      {tab === 'activities' ? (
        Object.entries(byDomain).map(([domain, list]) => (
          <section key={domain} style={{ marginBottom: 'var(--space-8)' }}>
            <h3 style={{ fontSize: 18, margin: '0 0 var(--space-3)' }}>{domain}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
              {list.map((a) => <ActivityCard key={a.code} activity={a} />)}
            </div>
          </section>
        ))
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {projects.map((p) => <ProjectCard key={p.code} project={p} />)}
        </div>
      )}

      <p style={{ fontSize: 13, color: 'var(--color-neutral-600)', marginTop: 'var(--space-4)' }}>
        “Stay with her” marks activities with small parts, scissors, water or heat.
      </p>
    </Shell>
  )
}
