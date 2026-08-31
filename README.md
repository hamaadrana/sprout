# Preschool Tracker

A web app for parents of 3–6 year olds in Pakistan. It tells the parent what
to teach today, gives her the material to teach it with, and keeps a record of
what the child has learned — mapped to the National Curriculum of Pakistan
2022-23 (Early Childhood Education).

The child never uses the app. The parent does.

## Status

Phases 1–5 of the build plan are complete:

1. **Curriculum foundation** — schema, 32-skill numeracy curriculum in
   [db/curriculum/numeracy.yml](db/curriculum/numeracy.yml) mapped to official
   ECE SLO codes, idempotent loader, `NextSkill` selection service.
2. **Today view** — daily plan (persisted, lazily generated), Got it / Needs
   practice logging; two consecutive "got it" outcomes master a skill.
3. **Skill library** — browse by domain with state badges, swap today's
   activity, mark skills already mastered.
4. **Worksheets** — nine generated, parameterised templates rendered as
   print-safe A4 HTML (print / save as PDF from the browser). Deterministic:
   re-printing gives the same sheet, "generate new practice" a different one.
5. **Portfolio** — photo uploads resized to ≤1600px WebP (originals are never
   stored), tagged to skills, monthly timeline.

Per the build plan, the next step is shipping to ~10 parents — not more code.
Phase 6 (progress reports, terms, shareable summaries) is gated on day-40
retention data.

## Stack

Rails 8 · PostgreSQL · Inertia.js + React (Vite) · Tailwind v4 · Devise ·
SolidQueue · ActiveStorage (ImageMagick) · RSpec

## Setup

```bash
bundle install
npm install
bin/rails db:create db:migrate
bin/rails curriculum:load
bin/rails server
```

Requires Ruby 3.4, PostgreSQL, Node 20+, and ImageMagick (`brew install
imagemagick`).

## Tests

```bash
bundle exec rspec
```

## Curriculum editing

Curriculum lives in YAML under `db/curriculum/` — one file per domain, loaded
with `bin/rails curriculum:load` (idempotent, upserts on `skills.code`).
Rules that matter:

- **Skill codes are stable and never renumbered.** All child progress keys on
  them.
- `position` gaps of 10 let you insert skills without renumbering.
- `prerequisites` form a graph per strand; the loader rejects cycles and
  unknown references.
- SLO codes reference the National Curriculum of Pakistan 2022-23 (ECE)
  progression grid. Write descriptors and activity text in our own words —
  never paste outcome text from the document.
- Never bundle third-party worksheets (Twinkl, TPT, K5…). Worksheets are
  generated; the SVG art is drawn in-repo.
