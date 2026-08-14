# Sprint Plan: FTF v1 Build

**Execution model:** solo agent, single session. Capacity is context budget and dependency
order, not engineer-days — so the plan is sequenced by *what unblocks what* and by
*shippable checkpoints*, and estimates are relative complexity (S/M/L) rather than points.

**Sprint Goal:** Ship a public, factually-honest FTF site with a working founder-recruitment
funnel — apply → book → prepare → track — backed by real auth and row-level-secured data.

---

## Checkpoint strategy

Three points where the build is coherent and could stop without leaving rubble:

| Checkpoint | After chunk | What works |
| --- | --- | --- |
| **CP1 — Public site live** | C3 | Landing page with real stats, nav, footer. Deployable as a marketing site with no auth, no database. |
| **CP2 — Funnel closed** | C7 | Sign in, apply, book a call, see it on a dashboard. The core product loop. |
| **CP3 — Fully operable** | C9 | Playbook, checklist, admin CMS. Team can run the program from the app. |

CP1 first is deliberate: the credibility asset — the thing a school administrator or a
referred student needs — is live while the funnel is still being built.

---

## Sprint Backlog

| # | Chunk | Size | Depends on | Delivers |
| --- | --- | --- | --- | --- |
| **C1** | **Scaffold + design tokens** — git repo, Next 16/React 18/TS strict/Tailwind 3, `next.config.js` CSP + security headers, `vercel.json`, `.gitignore`, `lib/theme.ts`, `styles/globals.css` with the verified palette, `tailwind.config.ts`, FTF logo + mark as SVG, favicon | M | — | Buildable shell |
| **C2** | **Static nav + footer** — square dashboard navbar, no scroll animation, hover+click dropdowns, full keyboard model (Enter/Space/Arrows/Escape/Tab-out), mobile disclosure, `aria-current`. Footer with LinkedIn, contact, VCS nonprofit disclosure | M | C1 | Site chrome |
| **C3** | **Landing page** — hero + dual CTA, impact bar (300+ / 7 / 4 countries), Our Story, Global Spotlight grid w/ honest empty state, How It Works 4-step | L | C2 | 🚩 **CP1** |
| **C4** | **Supabase schema + RLS** — 7 tables, policies, indexes, unique constraint on `demo_bookings.slot_id`, seed-admin SQL, `docs/SUPABASE-SETUP.md` | M | C1 | Data layer |
| **C5** | **Auth** — Google OAuth, `/auth/callback` route handler, session helpers, middleware route protection, profile upsert, sign-in/out UI in nav | M | C4 | Identity |
| **C6** | **Application flow** — 4-step form, prefilled + read-only email, localStorage draft, inline validation, server revalidation + rate limit + honeypot, `POST /api/applications`, existing-application guard | L | C5 | Intake |
| **C7** | **Booking** — slot picker from `demo_slots`, timezone default + override, format choice, note, `POST/DELETE /api/bookings`, race-safe, embedded in the application confirmation | L | C6 | 🚩 **CP2** |
| **C8** | **Playbook + dashboard** — 8 agenda cards, What FTF Provides, persisted interactive checklist, admin-editable follow-up block, gating logic; dashboard with status, calls, progress, single next action | L | C7 | Founder surface |
| **C9** | **Admin** — server-authorized routes, applications table w/ status advance, bookings list, Partner Spotlight CRUD, `site_content` editor | L | C8 | 🚩 **CP3** |
| **C10** | **Design critique → a11y audit → remediation → design system** — run both reviews, plan fixes, execute every fix, formalize `docs/DESIGN-SYSTEM.md` | L | C9 | Quality gate |

---

## Sequencing rationale

- **C4 before C5** — RLS policies must exist before the first authenticated write, or the
  first write happens against an open table and nobody notices until launch.
- **C6 before C7, but C7 renders inside C6's confirmation** — the spec's G1 goal (≥40%
  apply→book same session) depends on booking being a *step*, not a *destination*. Building
  them in that order but composing them together is the whole point.
- **C10 last, not sprinkled throughout** — a design critique on a half-built surface produces
  findings that evaporate. One pass over the finished thing is worth more.

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| No Supabase project / Google OAuth client exists yet | C5–C9 can't be verified against a live DB | Build against the real client with env-var config; ship `docs/SUPABASE-SETUP.md` with exact steps + SQL. Site degrades to CP1 behavior without env vars rather than crashing. |
| Missing real content (partners, chapter count, LinkedIn URL, contact email) | Tempting to fill with placeholders | Spec §"Verified facts" is normative: unset content renders an empty state or nothing at all. Enforced at component level, not by discipline. |
| Bright brand green fails contrast | Illegible CTAs, failed audit | Already caught in design pass — `#4CAF50` is decorative-only; `#15803D` (5.02:1) is the only green that carries text. Encoded as separate tokens so the failing value is never reachable for text. |
| Nav dropdowns are the most common a11y failure point | Keyboard users blocked from most of the site | Full keyboard model is written into C2's acceptance criteria, not deferred to C10. |
| Booking double-write on concurrent requests | Two founders, one slot | DB `UNIQUE(slot_id)` — application logic alone is insufficient. |

## Definition of Done (per chunk)

- [ ] `npx tsc --noEmit` clean — TypeScript strict, zero errors
- [ ] `npm run build` succeeds
- [ ] No hardcoded fact absent from SPEC §"Verified facts"
- [ ] Every interactive element keyboard-reachable with a visible focus ring
- [ ] Renders correctly at 320 / 768 / 1024 / 1440 with no horizontal scroll
- [ ] No `NEXT_PUBLIC_` prefix on any secret

## Explicitly cut from this sprint

Email/SMS notifications, CSV export, photo upload to Storage, booking reschedule, calendar
sync, per-chapter public pages, curriculum hosting, i18n. All recorded as P1/P2 in the spec —
cut for scope, not forgotten.
