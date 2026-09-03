# Preschool Tracker — working notes

Read README.md first. The authoritative product/scope document is the build
plan; its guardrails still apply:

- No AI features, payments, admin CMS, child-facing UI, multi-language UI,
  separate API, Redis/Sidekiq/GraphQL, gamification, or settings screens.
- Phase 6 (reports, terms, shareable summaries) only after real day-40
  retention data from ~10 parents.
- Ask before adding any gem.

## Invariants

- `skills.code` is stable, never renumbered; reseeding is idempotent and keyed
  on it (`CurriculumLoader`).
- `skill_progress` is a denormalised read model written only through
  `SessionLogger` (and the explicit mark-mastered / introduce paths);
  `log_entries` is the audit trail.
- `plan_items` are persisted at generation (`DailyPlan`), never computed on
  read. A refresh must show the same plan.
- Two consecutive `got_it` logs master a skill; `needs_practice` resets the
  streak and keeps it in rotation.
- Worksheet randomness must flow from `WorksheetSeed` (child + skill + date +
  variant) so re-prints are identical.
- Portfolio uploads: process to ≤1600px WebP via `PortfolioPhoto`; never
  attach the raw upload.

## Design system

The product is named **Sprout** (one place to change:
`config.x.app_name` in config/application.rb). The UI is a playful "crayon"
theme — Baloo 2 + Nunito, warm cream bg, coral #f4572e accent — replacing the
earlier Broadsheet newsprint at the user's request ("more energy"). The class
contract (`.btn`, `.seg`, `.tag`, `.field`, `.input`, `.radio`, `.n`, plus
`.pick-card`, `.chip-toggle`, `.stat-tile`, `.emoji-badge`) lives in
`app/frontend/entrypoints/main.css`; pages use inline styles over those CSS
variables. **No Urdu anywhere in the UI.** Emoji maps live in
`app/frontend/lib/flair.js`.

## Pronouns

Curriculum/library text is authored she/her. `Pronouns.adapt(text, gender)`
rewrites it for boys at render time (controllers call `adapt(...)` on every
content string sent to the client). Children have `gender` (girl/boy/nil);
UI chrome uses `child.pronouns` from shared Inertia props. Never hardcode
she/her in new chrome copy.

## Content data

- `db/curriculum/numeracy.yml` — 35 skills, NUM.A01…NUM.E05 (strand map is
  the loader's fallback STRANDS constant).
- `db/curriculum/literacy.yml` — English/phonics skills, LIT.A…D, with a
  `strands:` map in the domain header (the pattern all newer files follow).
- Four more domains from the same NCP ECE document: my_world.yml (WLD,
  Domain D), movement.yml (MOV, Domain G), little_me.yml (GRW, Domains
  A+E), creativity.yml (ART, Domain F). ~110 skills total. Cross-domain
  prereqs are allowed (loader resolves after all files).
  DailyPlan round-robins across domains, rotating the starting domain by
  date so all six get plan slots across a week.
- Onboarding "head start" answers pre-master skills via
  ChildrenController::HEAD_START (update it when curriculum codes change).
- `db/library/` — activity_library.yml (106 cross-domain activities) and
  make_it_projects.yml (45 projects), loaded by `rake curriculum:load_library`,
  keyed on stable codes. Supervision flags must always surface in the UI.

## Gotchas

- `@inertiajs/react` is pinned to v2 — inertia_rails 3.x serves the v2 page
  protocol (v3 client expects a JSON script tag and renders a blank page).
- Tailwind only auto-scans `app/frontend` (the Vite root); `app/views` is
  pulled in by the `@source` directive in
  `app/frontend/entrypoints/main.css`.
- The machine uses ImageMagick, not libvips: `variant_processor =
  :mini_magick` in application.rb.
- Devise pages use the `auth` layout (no React); the app pages are Inertia.
- Run tests with `bundle exec rspec`; style with `bundle exec rubocop`.
