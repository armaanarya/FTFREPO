# Financing the Future — Product Requirements Document

**Version:** 1.0
**Status:** Approved for build
**Owner:** Armaan Arya
**Org:** Financing the Future, a program of Valley Christian Schools

---

## Verified facts — the only numbers that may appear in the product

This section is normative. **No statistic, name, place, or quote may appear anywhere in the
codebase unless it is listed here or entered by an admin through the CMS at runtime.**

| Fact | Value | Use |
| --- | --- | --- |
| Students coached | 300+ | Impact stat |
| Years running | 7 | Impact stat |
| Countries | 4 — United States, Singapore, Vietnam, Spain | Impact stat + spotlight filter |
| Parent org | Valley Christian Schools (vcs.net) | Footer, About, nonprofit disclosure |
| Founded at | Valley Christian School | Our Story |

**Explicitly NOT verified and therefore NOT hardcoded anywhere:**

- Number of chapters or partners — the brief asked for a placeholder stat. A placeholder
  number is fabricated data. Instead the fourth stat tile renders **"4 Countries"**, and a
  separate optional `chapters_active` value lives in `site_content` as an admin-editable
  field. **The chapter-count tile does not render at all until an admin sets it.** No
  zero, no "—", no "coming soon" — the tile is absent.
- Partner spotlight entries — the Partners table ships **empty**. The section renders an
  honest empty state until the team adds real people. No seed rows, no lorem, no stock
  photos.
- Testimonials, quotes, dollar amounts raised, hours taught, session counts.

---

## 1. Problem Statement

Financing the Future has proven its model over 7 years — 300+ students coached across four
countries — but growth depends on individual students deciding to start a chapter and then
actually following through. Today there is no single place where a prospective founder can
see that the program is real, understand exactly what running a chapter requires, and
convert that interest into a scheduled conversation. Interest decays between "I heard about
this" and "I talked to someone," and school administrators have nothing to evaluate when a
student asks permission to run an outside program on campus.

The cost of not solving it: chapters are limited to the founders' personal network, each new
chapter requires manual explanation from scratch, and administrator hesitancy blocks
otherwise-motivated students.

## 2. Goals

| # | Goal | How we know it worked |
| --- | --- | --- |
| G1 | Convert interested visitors into scheduled conversations | ≥40% of users who start an application also book a demo in the same session |
| G2 | Reduce application abandonment | ≥70% of users who reach step 2 of the application submit it |
| G3 | Make the commitment concrete before the call | ≥60% of applicants open the Playbook before their scheduled call |
| G4 | Give administrators a self-serve credibility check | VCS affiliation, curriculum scope, and teaching boundaries reachable within 1 click of the landing page |
| G5 | Remove manual admin work from intake | 100% of applications and bookings land in a queryable table with status, no spreadsheet |

## 3. Non-Goals

| Non-goal | Why |
| --- | --- |
| Public chapter directory with per-chapter pages | We have no verified chapter roster. Ships when real data exists. |
| Curriculum hosting / LMS | The curriculum is delivered in onboarding, not the website. Dashboard links out. |
| Payments, donations, fundraising checkout | Fundraising pages are set up per-chapter by the team; out of scope for v1. |
| Email/SMS notification pipeline | v1 confirms on-screen and stores the record. Notifications are P1 — see §6. |
| Real-time calendar sync (Google Calendar, Calendly) | v1 uses admin-defined slots. Two-way sync is P2. |
| Public user profiles or social features | Not a community product. |
| Multi-language UI | Four countries, all operating in English today. Revisit with evidence. |

## 4. User Stories

### Prospective chapter founder (student, middle/high school)

1. As a student who just heard about FTF, I want to see students my age already running
   chapters in named places, so that I believe this is real and achievable.
2. As a student, I want to know exactly what running a chapter requires — time, format,
   commitments — **before** I apply, so I don't sign up for something I can't finish.
3. As an applicant, I want to sign in with my school Google account without creating another
   password, so that applying takes seconds.
4. As an applicant, I want my name and email filled in automatically, so I only answer the
   questions that actually need me.
5. As an applicant, I want to leave a multi-step form and come back later without losing my
   answers, so a phone interruption doesn't cost me the application.
6. As someone who just applied, I want to book the intro call immediately on the
   confirmation screen, so I don't have to make a second decision later.
7. As a founder awaiting my call, I want one page that tells me what will be covered and what
   I need to decide, so I show up prepared.
8. As a new founder, I want a checklist that saves my progress, so I can work through launch
   over several sittings.
9. As a returning user, I want the dashboard to tell me the single next thing to do, not just
   a status label.

### School administrator / faculty sponsor

10. As an administrator, I want to see the parent nonprofit and its affiliation immediately,
    so I can assess legitimacy without emailing anyone.
11. As an administrator, I want to see what is taught and what is explicitly *not* taught
    (no investment, tax, or legal advice), so I can approve it against school policy.
12. As an administrator, I want to book a call myself, so I can ask questions before a student
    commits.

### Internal FTF team (admin)

13. As a team member, I want every application in one table with a status I can advance, so
    intake stops living in email.
14. As a team member, I want to see all booked calls in chronological order, so I know my week.
15. As a team member, I want to add and edit Partner Spotlight entries without a developer, so
    the site reflects our newest chapters.
16. As a team member, I want to paste the post-launch-meeting follow-up text into a content
    block, so founders read the same instructions we email.

### Edge cases

17. As a user whose Google account has no name set, I still want a usable application form.
18. As a user who already applied, I want the application route to show my existing
    application rather than a blank form.
19. As a visitor with no partner spotlights published yet, I want the section to read as
    deliberate, not broken.
20. As a keyboard-only or screen-reader user, I want every flow — nav dropdowns, multi-step
    form, slot picker, checklist — fully operable without a mouse.

## 5. Requirements

### P0 — Must have

#### R1. Public landing page
- **AC1** Hero states the mission and offers primary CTA "Start a Chapter" and secondary CTA "Book a Demo".
- **AC2** Impact bar shows exactly: `300+ Students Coached`, `7 Years Running`, `4 Countries`. A fourth tile for active chapters renders **only if** `site_content.chapters_active` is set by an admin.
- **AC3** "Our Story" names Valley Christian School as the founding school and describes national + international expansion.
- **AC4** Global Spotlight renders a responsive card grid from the `partners` table. With zero rows it renders a written empty state, not skeleton cards.
- **AC5** "How It Works" shows 4 steps: Apply → Book a Demo → Onboarding Call → Launch Your Chapter.
- **AC6** Footer contains LinkedIn, contact email, and the nonprofit disclosure naming Valley Christian Schools.
- **AC7** Page is fully functional with JavaScript-dependent features degraded gracefully; content is server-rendered.

#### R2. Navigation
- **AC1** Top bar is **static** — fixed height, square corners, no scroll-driven resize, no layout animation, no motion on scroll.
- **AC2** Contains dropdown menus opening on hover **and** on click/Enter/Space.
- **AC3** Dropdowns are keyboard operable: `Enter`/`Space` opens, `Arrow` keys move between items, `Escape` closes and returns focus to the trigger, `Tab` out closes.
- **AC4** Dropdown triggers expose `aria-expanded`, `aria-haspopup`, and `aria-controls`.
- **AC5** Mobile renders an accessible disclosure menu; no hover dependency.
- **AC6** Current route is marked with `aria-current="page"` and a visible indicator that is not color-only.

#### R3. Authentication
- **AC1** Google OAuth via Supabase is the only sign-in method. No email/password UI exists.
- **AC2** Unauthenticated access to a protected route redirects to sign-in and returns to the intended destination after success.
- **AC3** A `profiles` row is created or updated on every sign-in from Google identity data.
- **AC4** Sign-out clears the session and returns to the landing page.
- **AC5** Admin status is a server-side database flag. It is never inferred from a client value or an email allowlist shipped to the browser.

#### R4. Chapter Founder Application
- **AC1** Multi-step form, 4 steps, with a visible step indicator announced to assistive tech.
- **AC2** Step 1 pre-fills name and email from the Google profile; email is read-only.
- **AC3** Collects: full name, email, school/organization, city, country, grade or role, motivation (free text), and whether applying individually or with a team (+ team details when "team").
- **AC4** Draft state persists to `localStorage` on every change and restores on return.
- **AC5** Client validation blocks advancing with invalid/missing required fields; errors are tied to inputs via `aria-describedby` and announced.
- **AC6** Server re-validates every field. Client validation is never trusted.
- **AC7** Submission writes one `applications` row with status `new`.
- **AC8** A user with an existing application sees its status instead of a blank form.
- **AC9** Confirmation screen embeds the booking step directly — the user can pick a slot without navigating away (addresses G1).
- **AC10** Rate limited server-side; honeypot field included.

#### R5. Demo / intro call booking
- **AC1** Slot picker lists available slots from an admin-managed `demo_slots` table.
- **AC2** Collects: slot, timezone (defaulted from the browser, user-changeable), phone vs. video preference, optional note.
- **AC3** Booking a slot marks it unavailable; a race on the same slot fails cleanly with a message, not a duplicate booking. Enforced by a DB constraint, not application logic alone.
- **AC4** Confirmation screen restates date, time in the user's timezone, format, and note.
- **AC5** The upcoming call appears on the dashboard.
- **AC6** User can cancel a booking, which releases the slot.
- **AC7** All times stored in UTC; rendered in the user's stated timezone.

#### R6. Chapter Launch Playbook
- **AC1** Requires sign-in. Unlocked once the user has **either** submitted an application **or** booked a call.
- **AC2** Renders the 8 launch-meeting agenda sections as cards.
- **AC3** Renders "What FTF Provides" as its own section (5 items).
- **AC4** Interactive checklist with the 4 founder action items; state persists per user in `checklist_progress` and survives reload and device change.
- **AC5** Checklist items are real checkboxes or `role="checkbox"` with full keyboard support; progress is announced.
- **AC6** An admin-editable content block renders the post-meeting follow-up instructions. Absent content renders nothing user-facing — never placeholder text.
- **AC7** Locked users see an explanation and a link to apply, not a 404.

#### R7. Founder Dashboard
- **AC1** Shows application status with a plain-language explanation of each state.
- **AC2** Shows upcoming and past calls.
- **AC3** Shows checklist completion as `n of m` plus a progress bar with a text equivalent.
- **AC4** Surfaces a single **primary next action** appropriate to the user's state (per G3 reasoning).
- **AC5** Curriculum resource links appear only when status is `active_chapter`.
- **AC6** New users with no application see a purposeful empty state with the apply CTA.

#### R8. Admin
- **AC1** Server-side authorization on every admin route and every admin API endpoint. A non-admin receives 403 from the API even with a forged client state.
- **AC2** Applications table with status advance through: `new` → `demo_scheduled` → `onboarded` → `active_chapter`.
- **AC3** Bookings list, chronological, with attendee and preferences.
- **AC4** Partner Spotlight CRUD: name, photo URL, location, country, bio, quote, chapter stats, published flag, sort order.
- **AC5** Editor for the Playbook follow-up content block and for `chapters_active`.
- **AC6** Destructive actions confirm before executing.

#### R9. Data model

```
profiles          id(uuid, = auth.users.id), email, full_name, avatar_url,
                  is_admin(bool, default false), created_at
applications      id, user_id → profiles, full_name, email, organization, city,
                  country, grade_or_role, motivation, applying_as('individual'|'team'),
                  team_details, status, created_at, updated_at
demo_slots        id, starts_at(timestamptz), duration_minutes, is_active, created_at
demo_bookings     id, user_id → profiles, slot_id → demo_slots (UNIQUE),
                  timezone, format('video'|'phone'), note, status, created_at
partners          id, name, photo_url, location, country, bio, quote, chapter_stats,
                  is_published, sort_order, created_at
checklist_progress id, user_id → profiles, item_key, is_complete, updated_at,
                  UNIQUE(user_id, item_key)
site_content      key(pk), value(text), updated_at, updated_by
```

- **AC1** RLS enabled on every table.
- **AC2** A signed-in user can read and write only their own `applications`, `demo_bookings`, and `checklist_progress` rows.
- **AC3** `partners` are publicly readable only where `is_published = true`; writable only by admins.
- **AC4** `UNIQUE(slot_id)` on `demo_bookings` enforces R5/AC3 at the database level.
- **AC5** The service-role key is never exposed to the client and never prefixed `NEXT_PUBLIC_`.

#### R10. Non-functional
- **AC1** Mobile-responsive from 320px up; no horizontal scroll at any breakpoint.
- **AC2** WCAG 2.1 AA: contrast ≥4.5:1 body / ≥3:1 large text and UI boundaries, visible focus on every interactive element, 44×44px minimum touch targets.
- **AC3** `prefers-reduced-motion` respected globally.
- **AC4** Security headers + CSP; no `unsafe-eval` in production.
- **AC5** All user-supplied strings sanitized and length-clamped server-side before persistence.
- **AC6** TypeScript strict mode, zero build errors.

### P1 — Nice to have

- Email confirmations for application and booking (Resend or Supabase Auth hooks)
- CSV export of applications and bookings from admin
- Admin filtering and search over applications
- Photo upload to Supabase Storage instead of pasted URLs
- Booking reschedule (currently cancel + rebook)

### P2 — Future

- Per-chapter public pages once a verified chapter roster exists
- Google Calendar two-way sync and automatic invites
- Curriculum hosting behind the member wall
- Chapter-level analytics: students reached per chapter, rolled into the impact bar
- Localized UI for Vietnam / Spain / Singapore chapters

## 6. Success Metrics

**Leading (days–weeks)**

| Metric | Target | Method |
| --- | --- | --- |
| Application start → submit | ≥70% | Count `applications` rows vs. step-1 views |
| Submit → booking in same session | ≥40% | `demo_bookings.created_at` within 10 min of `applications.created_at` |
| Playbook opened before call | ≥60% | Playbook route views by users with a future booking |
| Booking no-show | ≤25% | Admin marks booking status after the call |
| Application form error rate | ≤10% of submits | Server 400 responses on `/api/applications` |

**Lagging (weeks–months)**

| Metric | Target |
| --- | --- |
| Applications → active chapters | ≥30% within 90 days |
| Checklist completion before launch call | ≥80% of onboarded founders |
| Manual intake time per applicant | → 0; all intake in-app |

## 7. Open Questions

**Blocking**
- **[Stakeholder]** What is the real active chapter count? Until answered the fourth stat tile shows Countries and the chapter tile stays hidden.
- **[Stakeholder]** Real Partner Spotlight entries — names, photos, locations, quotes. The section ships empty by design until these exist.
- **[Stakeholder]** Contact email and LinkedIn URL for the footer.
- **[Stakeholder]** Exact nonprofit disclosure wording and whether FTF shares VCS's EIN.

**Non-blocking**
- **[Ops]** Who owns the admin flag in production, and who seeds the first admin?
- **[Ops]** Demo call length — 30 or 45 minutes? Slot duration is configurable; a default is fine.
- **[Design]** Do partner photos need a consistent crop ratio? v1 uses a fixed aspect box with `object-fit: cover`.
- **[Legal]** Does student data collection from minors require a parental-consent notice? Application collects name, email, school, city, grade. Flagged for review before public launch.

## 8. Timeline & Phasing

No external hard deadline. Suggested phasing:

- **Phase 1** — Foundation: repo, design tokens, static nav, landing page, logo. Ships as a
  public marketing site with real stats; usable immediately even before auth exists.
- **Phase 2** — Auth + data: Supabase Google OAuth, schema, RLS, route protection.
- **Phase 3** — Funnel: application → booking continuous flow, dashboard.
- **Phase 4** — Playbook + admin.
- **Phase 5** — Design critique, accessibility remediation, design system documentation.

Phase 1 is independently shippable, which de-risks the rest: the credibility asset is live
while the funnel is still being built.
