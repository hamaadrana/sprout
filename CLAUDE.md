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
