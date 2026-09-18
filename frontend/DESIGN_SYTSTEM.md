# ReaderDNA — Design System

Status: in progress (Day 6)
Last updated: Step 3 — Typography approved

---

## 1. Visual Direction Statement

ReaderDNA sits on a warm cream background, using soft/rounded border-radius
everywhere instead of sharp corners. A characterful but restrained
serif/display heading font pairs with a plain humanist sans body. Lilac is
used as a signature accent color, not a dominant one — everyday UI runs on
a warm amber/terracotta accent instead. Books are shown with real cover
images with subtle hover motion (lift/tilt). Buttons and inputs are
pill-shaped. Result: neither Goodreads' cold/corporate feel nor a typical
"AI SaaS gradient" look — a "cozy modern digital bookstore" with a touch of
premium/signature identity.

**Anti-patterns (Don't):**

- No sharp corners anywhere (cards, buttons, inputs, book covers)
- No generic 3D-rendered book/product illustrations
- No cute/childish illustration style (no cartoon mascots, no NFT-avatar style)
- No cold/corporate SaaS gradient look
- No Goodreads visual clone

---

## 2. Color System

### Token layers

1. Primitive tokens (raw hex) — never used directly in components
2. Semantic tokens (role-based names) — what components actually consume
3. Component tokens — rare, component-specific overrides only

### Palette

**Base & neutrals**
| Token | Hex | Role |
|---|---|---|
| `bg-page` | `#FAF6EF` | Page background |
| `bg-surface` | `#F3ECDD` | Card / modal / input surface |
| `border-default` | `#E4DBC7` | Hairline borders, dividers |
| `text-primary` | `#2E2A24` | Primary text |
| `text-secondary` | `#7A7264` | Secondary / muted text |

**Signature accent — lilac** (brand moments only, max 1–2 per screen)
| Token | Hex | Role |
|---|---|---|
| `accent-brand-tint` | `#F1ECFA` | Subtle background fills |
| `accent-brand` | `#9B7FDB` | Signature brand color (Reader DNA reveal, logo) |
| `accent-brand-strong` | `#6B4FA8` | Text on brand tint |

**Warm accent — amber/terracotta** (everyday UI, CTAs)
| Token | Hex | Role |
|---|---|---|
| `accent-warm-tint` | `#FBEAD1` | Subtle background fills |
| `accent-warm` | `#E0954B` | Primary CTA buttons, ratings, badges |
| `accent-warm-strong` | `#A8672B` | Text on warm tint |

**Semantic** (system feedback only — never decorative)
| Token | Hex | Role |
|---|---|---|
| `state-success` | `#7C9473` | Success feedback (muted sage) |
| `state-error` | `#C1584A` | Error feedback (muted brick) |
| `state-warning` | `#D9A441` | Warning feedback |

### Usage rules

- `accent-brand` (lilac) and `accent-warm` (amber) never compete as two
  "primary" actions on the same screen. Amber = action ("add to library",
  "get recommendation"). Lilac = identity/discovery moment (Reader DNA
  result, brand touches).
- Semantic colors are reserved for actual system feedback (form validation,
  toasts). Decorative use (e.g. rating stars) uses `accent-warm`, not
  `state-*` tokens.
- Semantic colors are intentionally muted/warm-adjusted — not pure
  saturated RGB — so they sit on the same warm undertone as the rest of
  the palette.

---

## 3. Typography

**Font families**

- Display/Heading: **Fraunces** (soft optical-size serif, characterful)
- Body: **Karla** (humanist sans, warm/rounded terminals)
- Accent (handwritten, sparing use): **Shantell Sans**

**Scale**
| Role | Font | Weight | Size | Line-height | Usage |
|---|---|---|---|---|---|
| Display (hero) | Fraunces | 600 | 40–56px | 1.1 | Landing page hero |
| H1 (page title) | Fraunces | 600 | 32px | 1.2 | Page titles |
| H2 (section) | Fraunces | 600 | 24px | 1.25 | Section headings |
| H3 (card/sub) | Fraunces | 500 | 18–20px | 1.3 | Card titles, BookCard title |
| Body large | Karla | 400 | 16px | 1.6 | Main content, descriptions |
| Body | Karla | 400 | 15px | 1.6 | Standard UI text |
| Caption/meta | Karla | 400 | 13px | 1.5 | Dates, author names, helper text |
| Accent (handwritten) | Shantell Sans | 500 | 16–20px | 1.4 | Max 1 line per screen |

### Do / Don't

**Do:**

- Fraunces only in headings — never in body/paragraph text
- Constrain body text width to ~65–75 characters for editorial readability
- Reserve italic for editorial moments only (quotes, personality
  descriptions) — not the default heading style

**Don't:**

- Don't use Shantell Sans in buttons, nav, or long text — only short,
  singular "personal touch" lines
- Don't run more than 3 font families total (currently at exactly 3 — stays fixed)
- Don't use Fraunces below 14px — it loses character at small sizes; drop
  to Karla instead

---

## 4. Spacing

Base unit: 4px. All padding/margin/gap values are multiples of this base.

| Token      | Value | Usage                                                                                         |
| ---------- | ----- | --------------------------------------------------------------------------------------------- |
| `space-1`  | 4px   | Micro spacing (icon-to-text)                                                                  |
| `space-2`  | 8px   | Title-to-subtitle spacing                                                                     |
| `space-3`  | 12px  | Button/input vertical padding                                                                 |
| `space-4`  | 16px  | Card internal padding (mobile)                                                                |
| `space-6`  | 24px  | Card internal padding (desktop), grid gap                                                     |
| `space-8`  | 32px  | Button horizontal padding, related-component-group spacing                                    |
| `space-10` | 40px  | Spacing between a section and directly-continuing content (e.g. hero → its immediate content) |
| `space-16` | 64px  | Spacing between distinct sections/topics (mobile)                                             |
| `space-24` | 96px  | Spacing between distinct sections/topics (desktop)                                            |

### Rule: spacing is proportional to semantic distance

Generous whitespace does not mean "maximum space everywhere." The amount of
space between two blocks should match how semantically related they are:

- **Continuing narrative** (hero → its immediate content, heading → its
  related grid): use `space-8`–`space-10` (32–40px). More than this feels
  disconnected, not premium.
- **Genuinely distinct topics/sections** (feature block → testimonials →
  footer): use `space-16`–`space-24` (64–96px) to signal "a new thought is
  starting."

### Rules

- Card internal padding never goes below 16px (mobile) / 24px (desktop
  default)
- Grid gaps between cards (e.g. BookCard grids) are minimum 20–24px
- This is the direct counter to Goodreads' dense/cramped list feel — never
  tighten spacing to fit more content on screen

## 5. Border Radius

Radius scales with component size — a fixed single value looks
under-rounded on large surfaces and over-rounded on small ones.

| Token         | Value         | Usage                                                                                                        |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| `radius-sm`   | 8px           | Badges, tags, tooltips                                                                                       |
| `radius-md`   | 12px          | Book cover thumbnails, small list items, **interactive selection controls** (e.g. Assessment answer options) |
| `radius-lg`   | 16px          | Main content cards (BookCard, feature cards)                                                                 |
| `radius-xl`   | 24px          | Modals, large panels, hero containers                                                                        |
| `radius-full` | 9999px (pill) | Buttons, inputs, avatars, search bars                                                                        |

### Rule: radius encodes role, not just size

Radius doesn't only scale with surface area — it also signals whether a
component is passive content or an interactive control, even at similar
sizes:

- `radius-lg` = passive content (the user reads/views it)
- `radius-md` = interactive control that resembles a card (the user
  selects/clicks it) — e.g. Assessment answer options, selectable filter
  boxes. Using the same radius as content cards would make it read as
  "just another card" instead of an actionable control.

### Do / Don't

**Do:** Increase radius as component size increases — a large modal at 8px
reads as an unfinished corner.
**Do:** Even book cover images get `radius-md` (12px) — not a hard square,
but not a pill either (it should still read as a cover image).
**Don't:** Zero (0px) radius anywhere — no exceptions.
**Don't:** Mix arbitrary radius values within one component (e.g. a 16px
card containing a 4px badge) — badges always use `radius-sm` (8px), no
invented in-between values.

## 6. Shadows

### Rule: resting state uses border, elevated state uses shadow

Never maximize both border and shadow on the same element — that reads as
heavy/dated (skeuomorphic). Pick the one that matches the element's state:

- **Resting** (normal page flow, e.g. a card inside a grid): border only,
  no shadow (`shadow-none`)
- **Elevated** (hover, floating overlay): shadow takes over, border fades
  or disappears

Shadow color is always warm-tinted, derived from `text-primary`
(`rgba(46,42,36,...)`) — never pure black/gray. This keeps shadows
consistent with the warm palette instead of introducing a cold gray cast.

### Scale

| Token         | Value                             | Usage                                                                                               |
| ------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `shadow-none` | none                              | Default state — all cards in normal page flow (separated by border only)                            |
| `shadow-sm`   | `0 2px 8px rgba(46,42,36,0.06)`   | Hover lift (BookCard hover, button hover) — element rises slightly above its immediate siblings     |
| `shadow-md`   | `0 6px 20px rgba(46,42,36,0.10)`  | Dropdown, popover, autocomplete — element floats above the entire page's content, not just siblings |
| `shadow-lg`   | `0 12px 32px rgba(46,42,36,0.14)` | Modal, dialog — highest elevation                                                                   |

### Rule: shadow intensity encodes elevation distance, not visual emphasis

A common mistake is picking shadow intensity based on "how much attention
should this draw." The correct axis is: **how much content is this element
floating above?**

- Hovering over its own siblings (a few cards) → `shadow-sm`
- Floating above the entire page (dropdown, popover) → `shadow-md`
- Floating above everything, blocking interaction (modal) → `shadow-lg`

A dropdown needs more separation than a hover card even though both should
feel "subtle" — subtlety comes from the shadow's softness/color, not from
minimizing its size regardless of elevation.

### Do / Don't

**Do:** Use a soft `transition` (see Step 11) when moving between resting
and elevated states — never an abrupt shadow appearance.
**Don't:** Use pure black/gray shadows — always warm-tinted.
**Don't:** Apply `shadow-lg` to anything in normal page flow — reserved for
true floating/blocking overlays (modals).

## 7. Core Components — Button, Input, Card

### Surface hierarchy

Depth increases from cream toward white (unusual vs. typical gray-card
SaaS patterns — intentional):

- `bg-page` (#FAF6EF) — page canvas
- `bg-surface` (#F3ECDD) — secondary panels, grouped/nested areas (never
  white — white is reserved for cards)
- Card background — white (#FFFFFF) — primary content surface, sits above
  both

### Button

| Variant   | Bg                    | Text             | Border                 | Radius        | Padding     | Hover                              |
| --------- | --------------------- | ---------------- | ---------------------- | ------------- | ----------- | ---------------------------------- |
| Primary   | `accent-warm` #E0954B | white            | none                   | `radius-full` | 12px / 32px | `accent-warm-strong` + `shadow-sm` |
| Secondary | transparent           | `text-primary`   | 1.5px `border-default` | `radius-full` | 12px / 32px | bg `bg-surface`                    |
| Ghost     | transparent           | `text-secondary` | none                   | `radius-full` | 12px / 24px | text → `text-primary`              |

Font: Karla 500, 15px. Lilac is never used in a button — see color usage
rules.

**Three-tier meaning (not just "importance level"):**

- Primary = the action the user should take
- Secondary = a real, comparably-weighted alternative action (e.g. "Sign
  up instead", "Continue with email" vs "Continue with Google")
- Ghost = a low-priority, navigational aside (Skip, Cancel, "Forgot
  password?") — NOT just "anything less important than primary"

### Input

- Bg: white, border 1px `border-default`, radius `radius-full`
- Padding: 12px vertical / 24px horizontal (+8px if a leading icon)
- Focus: border → `accent-warm`, plus soft `box-shadow: 0 0 0 3px`
  accent-warm-tint — never the browser default blue focus ring

### Card (generic)

- Bg: white, border 0.5px `border-default`, radius `radius-lg` (16px)
- Padding: `space-6` desktop (24px) / `space-4` mobile (16px)
- Resting: `shadow-none`. If interactive/clickable: hover →
  `shadow-sm` + `translateY(-2px)`

### Do / Don't

**Do:** At most 1 primary button per screen/view.
**Do:** Input placeholders show a realistic example ("300 sayfa civarı,
gizemli bir bilimkurgu"), not generic "Search...".
**Don't:** Use Ghost for a main action (e.g. "Add to library" should never
be Ghost).
**Don't:** Nest a white card inside another white card — use `bg-surface`
for the inner area instead.

## 8. ReaderDNA-specific Components

### BookCard

Anatomy (top to bottom):

1. Cover image — `radius-md` (12px), 2:3 aspect ratio, `overflow: hidden`
2. Title — Fraunces 600, 16–18px, max 2 lines
3. Author — Karla 400, 13px, `text-secondary`
4. Bottom row: rating (left) + genre tag (right)

Rating: `accent-warm` star icon + number (Karla 500, 13px) — decorative,
not semantic (see Step 5 rule).

Genre tag: `bg-surface` background, `text-secondary` text, `radius-sm`.
**Never `accent-brand` (lilac)** — a grid has many cards, so tagging every
one with the signature color would make lilac ordinary instead of rare/
meaningful.

**Hover interaction** (two synced layers, single transition):

1. Whole card lifts: `shadow-sm` + `translateY(-2px)` (standard Card hover
   rule)
2. Cover image itself scales slightly: `scale(1.02)` inside its
   `overflow: hidden` wrapper — evokes "lifting a book off a shelf"

### Other domain components (spec now, detail when the relevant page is built)

- **AssessmentOptionCard**: `radius-md` (Step 5 decision). Selected state:
  border → `accent-brand` (lilac) — one of the few places lilac is allowed
  as a frequent color, because this IS the Reader DNA core moment.
- **ReaderDNA dimension badge** (e.g. "Concept-driven 72%"): appears on the
  Reader DNA result screen — lilac-forward here, this is the signature
  moment the whole palette was built around.
- **ProgressBar** (assessment progress): fill = `accent-warm`, track =
  `bg-surface`.

## 9. Navigation

### Structure

**Desktop — sticky top nav:**

```
[Fraunces logo]   Discover   Library   Reader DNA        [search]  [avatar]
```

- Bg: white, bottom border `1px border-default` (no shadow — resting state
  rule from Step 6)
- Links: Karla 500, 15px, `text-secondary`; active link → `text-primary`
- Right side: search icon (expands into a pill input on click) + profile
  avatar (`radius-full`)

**Mobile — bottom tab bar:**

- Sticky, 4 tabs: Discover, Library, Assessment, Profile — icon + small
  label (Karla 500, 11px)
- Bg: white, top border `1px border-default`
- Rationale: thumb reachability — a top nav is hard to reach on mobile; a
  bottom tab bar is the standard consumer-app convention (not a dashboard
  pattern)

### Active state — soft pill indicator (not a hard underline)

To match the "bulutsu/pamuksu" (soft, cloud-like) feel requested for
navigation, the active state is **not** a sharp underline. Instead:

- A soft rounded pill (`radius-full`) background appears behind the active
  nav item/tab, filled with `accent-warm-tint` (#FBEAD1), text in
  `accent-warm-strong` (#A8672B)
- On mobile, the same pill mechanic applies behind the active tab's icon +
  label
- When switching between items, the pill **slides/morphs** to its new
  position rather than appearing instantly — a soft, continuous motion
  (exact easing curve and duration to be finalized in Step 11 Animation,
  but the _mechanic_ — sliding pill, not a snapping underline — is locked
  in here as a navigation-specific requirement)

### Do / Don't

**Do:** Max 3–4 primary links — more turns "discovery" into "dashboard
clutter".
**Do:** Active indicator always uses `accent-warm` — lilac is never used
in nav (it's a constantly-visible, everyday element, which breaks the
"rare/signature" rule).
**Don't:** Use a hamburger menu on desktop — with only 3–4 links, hiding
them adds unnecessary friction.
**Don't:** Add shadow to the nav bar — separation comes from the border
only.

## 10. Responsive Rules

### Principle

Breakpoints are derived from content behavior (how many BookCards fit
while preserving the generous-spacing rule, when a top nav becomes
unreachable by thumb), not copied from generic defaults first.

### Breakpoints

| Breakpoint     | Width      | BookCard grid | Nav                                        |
| -------------- | ---------- | ------------- | ------------------------------------------ |
| `sm` (mobile)  | <640px     | 2 columns     | Bottom tab bar                             |
| `md` (tablet)  | 640–1024px | 3 columns     | Bottom tab bar (<768px) / Top nav (≥768px) |
| `lg` (desktop) | >1024px    | 4–5 columns   | Top nav                                    |

The nav breakpoint (768px) is independent from the grid breakpoints — nav
switching is driven by thumb-reachability (Step 9), grid columns are
driven by card-fit + spacing preservation (Step 4). They are not tied to
the same threshold.

### Scaling rules

- Section-to-section spacing: desktop `space-24` (96px) → mobile
  `space-16` (64px)
- Card padding: desktop `space-6` (24px) → mobile `space-4` (16px) — never
  lower than this (Step 4 rule)
- Display heading (Fraunces): desktop 40–56px → mobile 28–32px; never
  below 14px at any breakpoint (Step 3 rule)
- BookCard cover aspect ratio (2:3) stays fixed at all breakpoints — only
  card width changes, never the aspect ratio (no stretched/distorted
  covers)

### Do / Don't

**Do:** Keep the generous-whitespace feel on mobile too — spacing shrinks
proportionally but never enough to feel cramped.
**Do:** Keep Fraunces present on mobile (sizes shrink, but the identity
doesn't disappear into all-Karla).
**Don't:** Tie the nav breakpoint to the grid breakpoints — they answer
different questions (see Principle above).

## 11. Animation / Motion

### Overall feel (decided via user preference poll)

- Playful but cozy spring/bounce — not aggressive, not minimal-only-fade
- Assessment page transitions: subtle slide + fade (NOT a literal page-flip
  effect — the page-turn idea from Day 6 moodboard discussion was refined
  into this abstracted version)
- Scroll reveal: fade + slide up on first appearance

### Motion tokens

| Token           | Value                               | Usage                                                                                                 |
| --------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `dur-fast`      | 150ms                               | Micro interactions (icon color change, checkbox)                                                      |
| `dur-base`      | 250ms                               | Default (button/card hover, nav pill movement)                                                        |
| `dur-slow`      | 400ms                               | Page-level transitions (assessment question change, modal open)                                       |
| `ease-soft`     | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Movement-based changes (position/scale) — this is where the spring/bounce feel comes from             |
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)`      | Pure color/opacity changes — spring easing on a color-only change reads as an odd delay, not a bounce |

### Rule: spring easing applies to movement, not color

`ease-soft` (the bounce curve) is reserved for transforms — position,
scale. Pure color or opacity transitions (e.g. text color on hover)
always use `ease-standard`. Mixing this up either kills the playful feel
(everything uses standard) or makes color changes feel laggy (spring on
color).

### Specific interactions

- **BookCard hover**: `translateY(-2px)` + `shadow-sm`, `dur-base` +
  `ease-soft`
- **Nav active pill**: slides to new position, `dur-base` + `ease-soft`
  (see Step 9)
- **Scroll reveal**: `translateY(16px)→0` + `opacity 0→1`, staggered
  ~80–90ms per item in a grid, `dur-base` + `ease-soft`. Triggers once on
  first appearance only — never re-triggers on repeated scroll past the
  same element
- **Assessment question transition**: outgoing question slides
  `translateX(-24px)` + fades out, incoming slides in from
  `translateX(24px)` + fades in, `dur-slow` + `ease-soft`. Both can briefly
  overlap (cross-fade) rather than a hard sequential cut

### Do / Don't

**Do:** Respect `prefers-reduced-motion` — fall back to `dur-fast`
opacity-only fades, no transforms, for accessibility.
**Don't:** Apply scroll-reveal animation on every element — only on
first-appearance content blocks (cards, sections), and only once.
**Don't:** Use `dur-slow` for micro-interactions — a 400ms button hover
feels sticky/delayed.

## 12. Global Do / Don't (Design Constitution)

This is a compiled quick-reference of every rule from sections 1–11 —
meant to be pasted directly into Cursor prompts or referenced from
`AGENTS.md` when generating any UI code.

**Color**

- `accent-brand` (lilac) and `accent-warm` never compete as two "primary"
  colors on the same screen
- Semantic (`state-*`) colors are for system feedback only — never
  decorative (e.g. ratings use `accent-warm`, not `state-success`)
- Lilac never appears in nav or buttons — reserved for signature moments
  only (Reader DNA reveal, selected Assessment option)

**Typography**

- Fraunces only in headings, never body text
- Fraunces never below 14px
- Italic is not the default heading style — editorial moments only
- Shantell Sans never in buttons/nav/long text — max 1 line per screen
- No more than 3 font families total

**Spacing & layout**

- Card padding never below 16px (mobile) / 24px (desktop)
- Grid gaps minimum 20–24px
- Spacing is proportional to semantic distance: continuing narrative =
  32–40px, distinct topic break = 64–96px

**Shape (radius & shadow)**

- Zero (0px) radius nowhere
- Radius scales with both component size AND role (passive content vs.
  interactive control)
- Resting state = border only; elevated state = shadow only — never both
  maximized together
- Shadows are always warm-tinted (`rgba(46,42,36,...)`), never black/gray
- Shadow intensity encodes elevation distance, not "how much attention to
  draw"

**Components**

- Max 1 primary button per screen
- Ghost variant is never used for a main action
- Never nest a white card inside a white card — use `bg-surface` instead
- BookCard genre tags are never lilac

**Navigation**

- Max 3–4 primary links
- Active indicator is always `accent-warm`, never lilac
- No hamburger menu on desktop
- No shadow on the nav bar — border only

**Motion**

- `ease-soft` (spring) only for movement/position changes; pure color
  transitions use `ease-standard`
- Scroll-reveal triggers once, on first appearance only
- `dur-slow` (400ms) is never used for micro-interactions
- `prefers-reduced-motion` is respected

**Overall identity**

- No sharp corners, no generic 3D illustration, no childish illustration
  style, no cold SaaS-gradient look, no Goodreads visual clone

## 13. Tailwind Token Mapping

Tailwind v4 uses CSS-first config via `@theme` (not `tailwind.config.js`).
Add this block to `frontend/src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Fonts */
  --font-sans: "Karla", sans-serif; /* becomes the default body font */
  --font-display: "Fraunces", serif;
  --font-accent: "Shantell Sans", cursive;

  /* Colors — neutrals */
  --color-page: #faf6ef;
  --color-surface: #f3ecdd;
  --color-line: #e4dbc7;
  --color-ink: #2e2a24;
  --color-ink-muted: #7a7264;

  /* Colors — signature (lilac) */
  --color-brand-tint: #f1ecfa;
  --color-brand: #9b7fdb;
  --color-brand-strong: #6b4fa8;

  /* Colors — warm accent */
  --color-warm-tint: #fbead1;
  --color-warm: #e0954b;
  --color-warm-strong: #a8672b;

  /* Colors — semantic */
  --color-success: #7c9473;
  --color-error: #c1584a;
  --color-warning: #d9a441;

  /* Radius — overrides Tailwind defaults with our scale */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadow — overrides Tailwind defaults (warm-tinted, replaces gray) */
  --shadow-sm: 0 2px 8px rgba(46, 42, 36, 0.06);
  --shadow-md: 0 6px 20px rgba(46, 42, 36, 0.1);
  --shadow-lg: 0 12px 32px rgba(46, 42, 36, 0.14);

  /* Easing */
  --ease-soft: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer base {
  body {
    background-color: var(--color-page);
    color: var(--color-ink);
  }
}
```

**Durations**: Tailwind v4's default duration scale doesn't include 250ms/
400ms. Use arbitrary values in components instead of inventing a token:
`duration-[250ms]`, `duration-[400ms]`. If `@theme`-based `--duration-*`
turns out to be supported in the installed version, prefer that — but
don't block on it.

### Mapping table

| Design system      | CSS var             | Utility                                                        |
| ------------------ | ------------------- | -------------------------------------------------------------- |
| bg-page            | `--color-page`      | `bg-page`                                                      |
| bg-surface         | `--color-surface`   | `bg-surface`                                                   |
| border-default     | `--color-line`      | `border-line`                                                  |
| text-primary       | `--color-ink`       | `text-ink`                                                     |
| text-secondary     | `--color-ink-muted` | `text-ink-muted`                                               |
| accent-brand\*     | `--color-brand*`    | `bg-brand` / `text-brand-strong`                               |
| accent-warm\*      | `--color-warm*`     | `bg-warm` / `text-warm-strong`                                 |
| radius-sm/md/lg/xl | `--radius-*`        | `rounded-sm/md/lg/xl`                                          |
| shadow-sm/md/lg    | `--shadow-*`        | `shadow-sm/md/lg` (Tailwind's default class names, our values) |
| ease-soft/standard | `--ease-*`          | `ease-soft` / `ease-standard`                                  |

**Task category:** 🔴 AGENT TASK — mechanical transcription. Review only
that no extra/invented tokens were added.

## 14. Reusable Component System

### Folder structure

```
frontend/src/
  components/
    ui/                    ← primitives
      Button.tsx
      Input.tsx
      Card.tsx
    book/                  ← domain-specific
      BookCard.tsx
    assessment/
      AssessmentOptionCard.tsx
      ProgressBar.tsx
    layout/
      TopNav.tsx
      BottomTabBar.tsx
```

### Pattern: `class-variance-authority` (cva) + `clsx`

Used for any component with variants (Button's primary/secondary/ghost,
etc.) instead of manual ternaries.

Reference implementation (Button):

```tsx
// components/ui/Button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center font-sans font-medium text-[15px] rounded-full transition-all duration-[250ms] ease-soft disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-warm text-white py-3 px-8 hover:bg-warm-strong hover:shadow-sm",
        secondary:
          "bg-transparent text-ink border-[1.5px] border-line py-3 px-8 hover:bg-surface",
        ghost: "bg-transparent text-ink-muted py-3 px-6 hover:text-ink",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonStyles({ variant }), className)} {...props} />
  );
}
```

### Cursor prompt template (for generating the rest of the components)

> "Create `components/ui/Input.tsx` following the ReaderDNA Design
> System. Follow the cva pattern used in `components/ui/Button.tsx`. Spec:
> pill-shaped (rounded-full), white bg, `border-line` border, focus state
> border `border-warm` + `shadow-[0_0_0_3px_var(--color-warm-tint)]`,
> padding py-3 px-6 (pl-10 if a leading icon). Use ONLY tokens defined in
> `@theme` (`bg-page`, `bg-surface`, `border-line`, `text-ink`,
> `text-ink-muted`, `bg-warm*`, `bg-brand*`) — never raw Tailwind defaults
> like `gray-500` or `blue-600`, and never arbitrary hex values."

**Task category:** Component generation → 🔴 AGENT TASK (using the prompt
format above). Reviewing the diff for token violations → 🟢 DO IT MYSELF.

---

**Design System document complete (Steps 1–14).** Real page implementation
starts from here, using this document as the reference for every Cursor
prompt going forward.
