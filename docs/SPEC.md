# Financing the Future — Product Spec

**Version:** 2.0 · **Status:** shipped
**Owner:** Armaan Arya · **Org:** Financing the Future, a program of Valley Christian Schools

> **v2.0 replaced v1.0.** The first version specified a gated founder platform — Google OAuth,
> a multi-step application, an in-app slot picker, a founder dashboard, and an admin CMS backed
> by seven Postgres tables. That was removed in full. The product is now a public informational
> site whose single conversion action is booking a Calendly call. Sign-in was removed from
> every page; there is no database, no API route, and no admin panel. `git log` has the v1
> implementation if it is ever wanted back.

---

## Verified facts — the only claims allowed in the product

Normative. **No statistic, name, or place may appear anywhere in the codebase unless it is
listed here.**

| Fact | Value |
| --- | --- |
| Students coached | 300+ |
| Years running | 7 |
| Countries | 4 — United States, Singapore, Vietnam, Spain |
| Parent org | Valley Christian Schools (vcs.net) |
| Founded at | Valley Christian School |
| Co-presidents | Armaan Arya · armaanarya100@gmail.com — Anay Sinhal · anay13366@gmail.com |
| Booking | https://calendly.com/anay13366/30min |

**Not verified, therefore absent from the product:**

- Chapter count, chapter names, and chapter officers — `CHAPTERS` in `lib/people.ts` is an
  empty array and `/officers` says so in plain words
- Leadership photographs — `Avatar` renders initials until real files exist at
  `public/people/`
- LinkedIn page URL — footer omits the link rather than pointing somewhere dead
- Testimonials, dollar amounts raised, hours taught, session counts

## 1. Problem

Financing the Future has run for seven years and coached 300+ students across four countries,
but a student who hears about it has nowhere to find out what running a chapter actually
requires, and no low-friction way to talk to someone. School administrators have nothing to
evaluate when a student asks permission to run an outside program on campus.

## 2. Goals

| # | Goal | Signal |
| --- | --- | --- |
| G1 | Turn interest into a booked conversation with the fewest possible steps | Calendly bookings; no form, no account between landing and booking |
| G2 | Set expectations before the call | The four founder responsibilities are stated on a public page, not revealed after commitment |
| G3 | Make the format choice obvious | Both program shapes described side by side on the landing page and `/get-started` |
| G4 | Give administrators a self-serve credibility check | VCS affiliation linked from the hero; real named leadership with direct emails |
| G5 | Never overstate the program | Every unverified value renders an honest empty state |

## 3. Non-goals

| Non-goal | Why |
| --- | --- |
| Accounts, sign-in, dashboards | Removed in v2. A 30-minute call converts better than an account. |
| Application form | Replaced by the call. With no admin panel, submissions would land where nobody reads them. |
| Embedded Calendly widget | Would require third-party scripts and frames in the CSP and set a tracking cookie on every visitor. An outbound link does not. |
| Public chapter directory with per-chapter pages | No verified chapter roster yet. `/officers` is the placeholder for it. |
| Curriculum hosting | Delivered directly to founders after onboarding. |
| Payments, donations, fundraising checkout | Handled per-chapter by the team. |

## 4. Surfaces

| Route | Contents |
| --- | --- |
| `/` | Hero with VCS link, dual CTA, impact bar (300+ / 7 / 4), what chapters teach, our story, both program formats, four-step how-it-works |
| `/get-started` | Formats in depth, the four founder responsibilities, the four things FTF provides, booking CTA ×2 |
| `/officers` | Chapter officer directory — honest empty state; renders the real directory automatically once `CHAPTERS` is non-empty |
| `/contact` | Co-presidents with photo, role, bio, direct email; booking CTA; organization statement |

## 5. Requirements

### R1 — No authentication anywhere
- No sign-in UI, no session, no protected route, no `middleware`/`proxy` gate.
- Every route is statically rendered and publicly reachable.

### R2 — Booking
- Every CTA links to `CALENDLY_URL`, `target="_blank"` with `rel="noopener noreferrer"`.
- Link text is accompanied by an `sr-only` "(opens Calendly in a new tab)".
- `SCHEDULING_NOTE` — stating that other times can be arranged by email — renders next to
  every booking CTA except where the same note already appears immediately above.

### R3 — Program formats
Both must be presented as equal options, never as tiers:
- **6–8 week program** — one-hour workshop per week, curriculum module by module.
- **Single deep-dive workshop** — one session of roughly two hours, one subject, hands-on,
  aimed at students leaving able to actually do it.

### R4 — Founder responsibilities
Stated publicly and in this order: finalize your team · know your availability · decide how
many times you will run it this school year · map where and how you will conduct outreach and
teach, including what opportunities exist locally and how accessible students are.

### R5 — What FTF provides
Complete curriculum and teaching materials · guidance on outreach and coordinating classes ·
access to the LinkedIn page for visibility · personalized social media graphics and posts for
recruiting students.

### R6 — People
- Armaan Arya and Anay Sinhal are listed as **Co-Presidents** of the international program,
  with photos and direct email addresses.
- `Avatar` falls back to initials when a photo file is absent — never a stock portrait.

### R7 — Non-functional
- Responsive from 320px, no horizontal scroll at any breakpoint.
- WCAG 2.1 AA — see `docs/DESIGN-SYSTEM.md` §5 for the enforced invariants.
- CSP permits no third-party origins: `img-src 'self' data:`, `connect-src 'self'`.
- TypeScript strict, zero build errors.

## 6. Open questions

- **[Stakeholder]** LinkedIn page URL for the footer.
- **[Stakeholder]** Leadership photo files for `public/people/`.
- **[Stakeholder]** Real chapter and officer data for `/officers`.
- **[Legal]** Minors are directed to a third-party scheduling tool that collects name and
  email. Worth confirming this is acceptable under school policy before promoting the site
  widely.
