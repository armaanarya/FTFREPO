# Financing the Future — Design System

Source of truth: [`styles/globals.css`](../styles/globals.css) (CSS variables) and
[`tailwind.config.ts`](../tailwind.config.ts) (semantic Tailwind names mapping onto them).
Components live in `components/ui/` (primitives) and `components/site/` (composed chrome).

**Every contrast ratio in this document was computed, not estimated.** Where a value sits
close to a threshold, the margin is stated so a future change cannot quietly break it.

---

## 1. The two rules that matter most

### Rule 1 — The brand green cannot carry text

The logo green `#4CAF50` measures **2.78:1** on white. That fails WCAG AA for text at any
size. It is stored as its own token so the failing value is never reachable by accident:

| Token | Value | Ratio on white | Allowed for |
| --- | --- | --- | --- |
| `--green-brand` | `#4CAF50` | **2.78:1 — FAILS** | Logo, illustration fills, decorative marks. **Never text. Never a CTA background under white text.** |
| `--green-600` | `#1A9748` | 3.77:1 | Large text (≥24px) and UI boundaries only |
| `--green-cta` | `#15803D` | **5.02:1 both directions** | The workhorse: CTA background *and* green body text |
| `--green-800` | `#14532D` | 9.11:1 | Headings, dark green surfaces |
| `--green-900` | `#0B3D20` | 13.4:1 | Text on green tints |

`--green-cta` is unusual and useful: at 5.02:1 it passes as *foreground on white* **and** as
*background under white text*. One token covers both directions, which is why buttons and
green links share it.

### Rule 2 — The nav is static, on purpose

The top bar is fixed at 64px, square-cornered (`--radius-nav: 0`), and has **no** scroll-driven
resize, no transform on scroll, no entrance animation, and no rotating chevron. It reads as
dashboard chrome rather than a marketing header.

The only transitions anywhere in the nav are 150ms `color`/`background` changes that
communicate state. If you find yourself adding motion here, that is a departure from the
brand, not a polish pass.

Content cards *are* rounded (`--radius-card: 12px`). The square-chrome / rounded-content
contrast is deliberate.

---

## 2. Tokens

### Colour

| Group | Tokens |
| --- | --- |
| Green | `--green-brand` `--green-900` `--green-800` `--green-cta` `--green-600` `--green-100` `--green-50` |
| Beige | `--beige-50` (alt sections) `--beige-100` (warm surface) `--beige-200` (border on beige) |
| Ink | `--ink-900` 18.9:1 · `--ink-700` 13.6:1 · `--ink-600` 8.9:1 (body) · `--ink-500` 5.3:1 (muted) |
| Lines | `--border` (decorative only, 1.3:1) · `--border-strong` (**required** on form controls) |
| Status | `--status-{new,scheduled,onboarded,active}` + a `-surface` tint for each |
| Feedback | `--error` `--error-surface` `--success` `--success-surface` |

**`--ink-500` is the floor.** At 5.3:1 on white and 4.98:1 on beige-50 it is the lightest grey
that still passes AA for body text. Nothing lighter may hold text.

**`--border` vs `--border-strong` is not a style choice.** WCAG 1.4.11 requires 3:1 for the
boundary of a UI component. `--border` (1.3:1) is legal for a decorative divider or a card
edge and **illegal on an input**. `--border-strong` is `#7E7768` — 4.44:1 on white, 4.15:1 on
beige-50, **3.81:1 on beige-100**. That worst case clears the bar by 27%.

> Its previous value `#8E887A` measured **3.03:1** on beige-100 — a technical pass with
> effectively no margin. Any future warming of the background tint would have broken it
> silently. Headroom is the point.

### Type

Two families, loaded via `next/font` with `display: swap`:

- **Manrope** (`font-display`) — headings, stat numbers, nav labels. Weights 600/700/800.
- **Inter** (`font-sans`) — body and all UI. Weights 400–700. Chosen partly for real tabular
  figures; `.tabular` applies `font-variant-numeric: tabular-nums` so stat rows and admin
  tables do not reflow as values change.

Scale (`tailwind.config.ts`): `xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 ·
4xl 36 · 5xl 48 · 6xl 60`. Body line-height 1.6; display 1.05–1.2 with `-0.02em` tracking.

**Base body text is 16px and never smaller for prose.** `text-sm` (14px) is for metadata,
hints, and table cells — not paragraphs.

### Spacing, radius, elevation

4pt scale throughout. Radius: `--radius-nav: 0` · `--radius-card: 12px` · `--radius-ctl: 8px`
(buttons, inputs) · `--radius-chip: 6px` (badges — deliberately not pill-shaped; fully round
badges read as consumer-app, not institutional).

Three shadows only, all low-alpha neutral: `--shadow-sm` (cards), `--shadow-md`, `--shadow-lg`
(dropdown panels). There is no elevation above `lg`.

### Layout

`max-w-content` 1160px · `max-w-prose` 68ch. Breakpoints 375 / 640 / 768 / 1024 / 1440.
`--tap: 44px` is the minimum interactive target.

---

## 3. Components

### Button (`components/ui/button.tsx`)

| Variant | Use when |
| --- | --- |
| `primary` | The one main action on a screen |
| `secondary` | Supporting actions; also the "safe" side of a confirmation |
| `ghost` | Tertiary, destructive-adjacent, and dismissals |

Sizes `md` (44px) and `lg` (52px). Both clear the tap minimum, so no instance needs padding
tweaks to be compliant.

- **`forwardRef`** — required. Wherever an inline confirmation replaces the button the user
  just activated, the caller must move focus onto the confirm control or focus falls to
  `<body>` (WCAG 2.4.3).
- **`.on-green`** — the `primary` variant carries this class. The global focus ring is
  `--green-cta`; on a green button that ring is invisible, so `.on-green:focus-visible` swaps
  it to white.
- Ships as `<button>` (`Button`) and `<Link>` (`ButtonLink`). Never fake one with the other —
  a navigation styled as a button must still be a link.

### Field primitives (`components/ui/field.tsx`)

`TextField`, `TextArea`, `RadioGroup`. Shared contract:

- A real, **visible** `<label>` — a placeholder is never a label.
- Errors wired via `aria-describedby` + `aria-invalid`, rendered below the control.
- Error text pairs an **icon with the words** — colour alone never signals the error.
- Required fields show `*` (`aria-hidden`) plus an `sr-only` "(required)".
- `RadioGroup` renders a `<fieldset>`/`<legend>` so the question is announced with its options.
- `data-field` prop exists solely as a focus hook — TypeScript will not accept arbitrary
  `data-*` on a custom component, so it is declared explicitly.

### Avatar (`components/ui/avatar.tsx`)

Portrait with an **initials fallback**. If the image is missing or fails to load it renders the
person's initials, never a stock portrait or a broken-image icon. This is what lets
`lib/people.ts` reference photo paths that do not exist yet — drop the file in and it appears.

### BookACall (`components/ui/calendly.tsx`)

The single booking CTA, used on every page. A plain outbound link rather than an embedded
widget, so the CSP can stay free of third-party origins and no tracking cookie is set on
visitors who merely scroll past.

It renders `SCHEDULING_NOTE` alongside the button by default. Suppress it with
`showNote={false}` only where the note already appears nearby — never because the layout is
tight. A student whose free hour falls outside the published slots needs to be told they can
still reach us.

### NavBar (`components/site/nav-bar.tsx`)

Static per Rule 2. Dropdown keyboard model (APG disclosure):

| Key | On trigger | In menu |
| --- | --- | --- |
| `Enter` / `Space` | Toggle, focus first item | Activate link |
| `↓` / `↑` | Open at first / last item | Move, wrapping |
| `Home` / `End` | — | First / last item |
| `Escape` | Close | Close, **return focus to trigger** |
| `Tab` | — | Close, let focus leave naturally |

Hover also opens a menu, but hover is never the *only* way in.

**No `aria-haspopup`.** The panel is a disclosure containing a list of links, not a
`role="menu"` with `menuitem`s. Advertising "menu" semantics the panel does not implement is a
4.1.2 violation, so the trigger exposes `aria-expanded` + `aria-controls` and nothing more.

Active route: 3px bottom border **plus** a weight change **plus** `aria-current="page"` —
three signals, none of them colour-only.

---

## 4. Patterns

### Empty states

One rule: **an empty state explains, it does not fake.** No skeleton cards standing in for
content that does not exist, no placeholder people, no "0" where a real number is unknown.

The Global Spotlight with zero published partners renders prose saying profiles are being
collected and why. The landing page's fourth stat tile is **absent entirely** until an admin
sets a real chapter count — not zero, not an em dash.

Two visual treatments, applied consistently:
- **Solid border + white** — public-facing, where the empty state is the message
- **Dashed border + beige-50** — signed-in surfaces, where it reads as "nothing here yet"

### External links

Anything leaving the site (Calendly, vcs.net, mailto) opens with `rel="noopener noreferrer"`
and carries an `sr-only` note where the destination is not obvious from the link text — e.g.
"(opens Calendly in a new tab)". A sighted user sees the arrow glyph; a screen-reader user
gets the same warning in words.

---

## 5. Accessibility invariants

These are not aspirations; they were audited and are currently true.

| Invariant | Where enforced |
| --- | --- |
| Contrast: 18 measured text pairs pass AA, 7 reach AAA | Token layer |
| Form control borders ≥3:1 | `--border-strong`, 27% margin |
| 44px minimum tap target | `Button` sizes, nav/footer link padding |
| Visible focus on **every** focusable element | Global `:focus-visible`; `.on-green` inverts it |
| `Escape` closes menus and restores focus | `NavBar`, desktop dropdowns and mobile panel |
| Skip link actually moves focus | `<main tabIndex={-1}>` |
| Meaning never signalled by colour alone | Icons paired with text throughout |
| `prefers-reduced-motion` honoured | Global media query |
| Wide content scrolls inside its own container | The page body never scrolls sideways at any breakpoint |

### The trap worth remembering

A visually-hidden `<input>` inside a styled `<label>` is a common and attractive pattern — and
it silently destroys the focus indicator, because the focused element is the one you hid. The
label must carry the ring via `has-[:focus-visible]`. This shipped broken once and was caught
in audit; do not reintroduce it if form controls come back.

---

## 6. Token coverage

Audited across `app/` and `components/`:

| Category | Status |
| --- | --- |
| Colour | **No raw hex outside the token layer.** The only literal hex remaining is Google's four brand colours in the sign-in mark, which are fixed by Google's guidelines and must not be tokenised. |
| Spacing | 4pt scale; arbitrary values only for `[44px]` (the tap minimum, now `--tap`) and a small number of optical type sizes. |
| Typography | Two families, one scale, both from `next/font`. |
| Radius / shadow | Fully tokenised. |

### When adding a component

1. Reach for an existing token. If none fits, add it to `globals.css` **and** map it in
   `tailwind.config.ts` — never inline a hex.
2. If it holds text, compute the contrast before shipping. Do not eyeball it.
3. If it is interactive: 44px minimum, visible focus, keyboard-operable, and a name/role/value
   that matches what it actually does.
4. If it can be empty, design the empty state — and make it honest.
