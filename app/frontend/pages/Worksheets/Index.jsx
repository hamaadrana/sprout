import { Link } from '@inertiajs/react'
import Shell from '../../components/Shell'

const STATE_TAGS = {
  mastered: { label: 'mastered', className: 'tag tag-neutral' },
  practising: { label: 'practising', className: 'tag tag-accent' },
  introduced: { label: 'introduced', className: 'tag tag-accent' },
  not_started: { label: 'not started', className: 'tag tag-outline' },
}

export default function WorksheetsIndex({ rows }) {
  return (
    <Shell active="Worksheets">
      <div className="n">Worksheets</div>
      <h1 style={{ fontSize: 34, margin: 'var(--space-2) 0 var(--space-2)' }}>
        Generated, not collected
      </h1>
      <p style={{ fontSize: 15, color: 'var(--color-neutral-700)', maxWidth: '58ch' }}>
        Every sheet is generated fresh for your child — re-printing gives the identical
        sheet, “new practice” a different one. Print at home or at the photocopy shop.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)', marginTop: 'var(--space-6)' }}>
        {rows.map((group) => (
          <div key={group.strand}>
            <h3 style={{ fontSize: 17, margin: '0 0 var(--space-3)' }}>{group.strand}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {group.rows.map((row) => {
                const tag = STATE_TAGS[row.state] || STATE_TAGS.not_started
                return (
                  <div key={row.skill_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-2)', fontSize: 14 }}>
                    <Link href={`/worksheets/${row.skill_id}`} style={{ color: 'var(--color-text)', textDecorationColor: 'var(--color-neutral-400)' }}>
                      {row.title}
                    </Link>
                    <span style={{ display: 'flex', gap: 6, alignItems: 'baseline', flex: 'none' }}>
                      <span style={{ font: '10px ui-monospace, Menlo, monospace', color: 'var(--color-neutral-600)' }}>
                        {row.template}
                      </span>
                      <span className={tag.className}>{tag.label}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  )
}
