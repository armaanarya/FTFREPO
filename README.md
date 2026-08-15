# Financing the Future

The website for **Financing the Future** — a student-led financial literacy program and a
program of [Valley Christian Schools](https://vcs.net).

The site explains what the program is, makes clear what running a chapter involves, and gets
interested students onto a call with us.

## Stack

- Next.js 16 (App Router) · React 18 · TypeScript strict
- Tailwind CSS 3 with CSS-variable design tokens
- **No database, no authentication, no API routes.** Every page is statically rendered.

## Run locally

```bash
npm install && npm run dev
```

Open <http://localhost:3200>.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Mission, impact, story, the two program formats, how it works |
| `/get-started` | Program formats in depth, what we ask of founders, what we provide |
| `/officers` | Chapter officer directory — empty until real officers are published |
| `/contact` | Co-presidents with photos and direct email addresses |

There is **no sign-in anywhere on this site.** Booking happens through Calendly; questions go
to a real person's inbox.

## Booking

All "Book a call" buttons link to `CALENDLY_URL` in [`lib/program.ts`](lib/program.ts).

It is a plain outbound link, not an embedded widget — deliberately. An embed would require
loosening the CSP to allow third-party scripts and frames, and would set a Calendly cookie on
every visitor who merely scrolled past it. A link only sends people to Calendly when they
choose to go.

Every booking CTA is accompanied by `SCHEDULING_NOTE`, which tells people that the published
times are not the only options and that they can email us to arrange something else. That note
is not decoration: chapters run across four countries and timezones, and a student whose only
free hour falls outside the calendar will otherwise assume the program is not for them.

## Adding content

Everything editable lives in plain TypeScript. No CMS, no admin panel.

| What | Where |
| --- | --- |
| Org facts, impact stats, countries | [`lib/site.ts`](lib/site.ts) |
| Calendly URL, program formats, expectations, what we provide | [`lib/program.ts`](lib/program.ts) |
| Co-presidents and chapter officers | [`lib/people.ts`](lib/people.ts) |
| Navigation | [`lib/nav.ts`](lib/nav.ts) |

### Leadership photos

Save them as:

```
public/people/armaan-arya.png
public/people/anay.png
```

Those exact paths are already referenced in `lib/people.ts`. Until the files exist, the
`Avatar` component renders the person's initials — never a stock portrait or a broken image.
Drop the files in and they appear automatically; no code change needed.

### Chapter officers

`CHAPTERS` in `lib/people.ts` is an empty array. Add one `Chapter` object per chapter, each
with its own `officers`. The `/officers` page switches from its empty state to the directory
automatically once the array is non-empty.

## The data honesty rule

**Nothing in this codebase states a fact about the organization that has not been verified.**

Verified and hardcoded:

- 300+ students coached
- 7 years running
- 4 countries — United States, Singapore, Vietnam, Spain
- Founded at Valley Christian School; a program of Valley Christian Schools
- Co-presidents Armaan Arya and Anay Sinhal, and their email addresses

Deliberately absent until real values exist:

- **Chapter officers.** `CHAPTERS` is empty and `/officers` says so in plain words rather than
  showing example students.
- **Leadership photos.** Initials until the real files are added.
- **LinkedIn URL.** `lib/site.ts` holds `null`; the footer omits the link rather than pointing
  somewhere dead.

If you add a claim to `lib/site.ts`, it needs a source.

## Notes

- Security headers and a strict CSP are set in [`next.config.js`](next.config.js). No
  third-party origins are permitted — `img-src` is `'self' data:` and `connect-src` is
  `'self'`.
- Accessibility rules the components are built to are documented in
  [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).
