# Financing the Future

The website and founder platform for **Financing the Future** — a student-led financial
literacy program and a program of [Valley Christian Schools](https://vcs.net).

The site does three jobs: show what the program has actually done, recruit and onboard local
chapter founders, and book intro calls.

## Stack

- Next.js 16 (App Router) · React 18 · TypeScript strict
- Tailwind CSS 3 with CSS-variable design tokens
- Supabase — Google OAuth + Postgres + row-level security

## Run locally

```bash
npm install && npm run dev
```

Open <http://localhost:3200>. The public site works with no configuration. For accounts,
applications, and booking, follow [`docs/SUPABASE-SETUP.md`](docs/SUPABASE-SETUP.md).

## Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Mission, impact, story, spotlight, how it works |
| `/signin` | Public | Google OAuth only |
| `/apply` | Signed in | Four-step chapter founder application, ending in the booking step |
| `/book` | Signed in | Slot picker with timezone handling |
| `/playbook` | Applied or booked | Launch meeting agenda, action-item checklist, what FTF provides |
| `/dashboard` | Signed in | Status, calls, checklist progress, single next action |
| `/admin` | Admin only | Applications, calls, availability, spotlight CMS, editable content |

## Documentation

- [`docs/SPEC.md`](docs/SPEC.md) — the PRD: problem, goals, requirements, acceptance criteria
- [`docs/SPRINT-PLAN.md`](docs/SPRINT-PLAN.md) — how the build was sequenced
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — tokens, components, accessibility rules
- [`docs/SUPABASE-SETUP.md`](docs/SUPABASE-SETUP.md) — database, OAuth, environment variables

## The data honesty rule

**Nothing in this codebase states a fact about the organization that has not been verified.**

Verified and hardcoded:

- 300+ students coached
- 7 years running
- 4 countries — United States, Singapore, Vietnam, Spain
- Founded at Valley Christian School; a program of Valley Christian Schools

Deliberately absent until real values exist:

- **Partner spotlight entries.** The `partners` table ships empty and the section renders a
  written explanation instead of placeholder cards.
- **Active chapter count.** Admin-editable. Until set, that stat tile does not render — there
  is no zero, no dash, no "coming soon".
- **Contact email and LinkedIn URL.** `lib/site.ts` holds `null` for both; the footer omits
  each link rather than pointing somewhere dead.
- **The playbook follow-up block.** Empty until the team pastes their real text.

`lib/site.ts` is the normative list. If you add a claim there, it needs a source.

## Security notes

- RLS on every table; users can only reach their own rows.
- Admin status is a database column, checked server-side. Admin API routes re-check
  independently of the page guard — a layout redirect means nothing to a `fetch()`.
- `lib/supabase/admin.ts` is `server-only`; the service-role key cannot reach the browser.
- All auth-gated routes are `force-dynamic` so an auth check can never be compiled away by
  static prerendering.
- Double-booking is prevented by a database unique index, not by application logic.
- CSP and security headers are set in `next.config.js`; no `unsafe-eval` in production.
