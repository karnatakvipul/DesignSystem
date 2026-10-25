# The design system

Two layers of tokens, and a rule about which to reach for.

**Theme tokens** are colour. They change between the four themes, and
`ThemeProvider` swaps them at runtime.

**System tokens** are shape — radius, control height, type, elevation, motion.
They do not change between a light theme and a dark one, so they are declared
once and are the same everywhere.

Everything is named for **what a thing is**, not how big it is. `rounded-control`
says where it belongs; `rounded-lg` only says how it looks. That difference is
not pedantry — it is the whole reason the system exists.

---

## Why

Before the tokens, the library had settled on four radii in almost exactly equal
use — `rounded-md` (36 uses), `rounded-lg` (36), `rounded-xl` (34),
`rounded-full` (38) — with nothing to say which was right for a given surface.
Six shadows. Eight type sizes plus `text-[10px]` and `text-[11px]`. And around
sixty ad-hoc pixel values: `[32px]`, `[34px]`, `[36px]`, `[40px]`, `[44px]`,
each one somebody eyeballing a single component in isolation.

None of those was wrong on its own screen. That is exactly the problem: nothing
looks broken, and the product slowly stops looking like one product.

---

## Radius

| Token | Value | Use for |
|---|---|---|
| `rounded-control` | 8px | Buttons, inputs, menu items, tags |
| `rounded-surface` | 12px | Cards, panels, tables, popovers |
| `rounded-overlay` | 16px | Modals and sheets |
| `rounded-pill` | full | Badges, avatars, toggles |

Three steps, not six. A surface reads as *containing* its controls when its
corners are slightly rounder than theirs — that relationship is why control and
surface are separate tokens rather than one value.

## Control height

| Token | Value | Use for |
|---|---|---|
| `h-control-sm` | 28px | Dense tables, inline actions |
| `h-control-md` | 36px | The default |
| `h-control-lg` | 44px | Touch targets |

One scale for anything you click or type into, so a button sits level with the
input beside it. `lg` is 44px because that is the smallest comfortable pointer
target on a touch screen — which is why `Button` steps every size up one on
small viewports and settles back on a pointer device.

## Type

| Token | Value | Use for |
|---|---|---|
| `text-caption` | 11px | Timestamps, helper text |
| `text-body-sm` | 12px | Table cells, dense UI |
| `text-body` | 14px | The default |
| `text-title` | 16px | Panel and dialog headings |
| `text-display` | 24px | Page headings |

Deliberately short. Long scales invite picking whatever looks right in one
place, which is how `text-xs`, `text-[11px]` and `text-sm` ended up side by side
with no rule behind any of them.

## Elevation

| Token | Use for |
|---|---|
| `shadow-raised` | A card lifting off the page |
| `shadow-floating` | Menus, popovers, dropdowns |
| `shadow-overlay` | Modals, above everything |

Named for the relationship rather than the blur radius. Six interchangeable
shadow sizes gave no way to answer "should a popover out-shadow a card?"

## Motion

`--duration-fast` (120ms), `--duration-slow` (200ms), `ease-standard`.

Two durations. Anything slower on an interface people use all day stops reading
as responsive and starts reading as lag. One easing, so movement feels like it
comes from one place.

These are plain custom properties, not Tailwind utilities — `--duration-*` is
not a namespace Tailwind generates from, so use
`duration-[var(--duration-fast)]`. Declaring them inside `@theme` would look
like it worked and silently produce nothing.

## Stacking

`--z-sticky` (20) · `--z-dropdown` (50) · `--z-overlay` (100) · `--z-toast` (200)

The values matter relative to each other and nowhere else: a dropdown opened
inside a modal has to sit above it, and a toast above both, or a confirmation
disappears behind the dialog that asked for it. Gaps of ten leave room to insert
a layer without renumbering.

---

## Colour

34 tokens per theme, four themes, and every theme defines every token — a
missing one renders as an unset CSS variable, which is an invisible control on
that theme alone.

Reach for the semantic name, never a raw colour:

- Surfaces — `bg-canvas`, `bg-card`, `bg-chrome`
- Text — `text-ink-primary`, `text-ink-secondary`, `text-ink-muted`,
  `text-ink-onchrome`
- Accent — `bg-accent`, `text-accent`, `bg-accent-muted`
- Status — `text-status-online`, `text-status-warn`, `text-status-offline`

**`-onchrome` is not interchangeable with `-primary`.** Chrome is the sidebar
and header, which are dark in some themes and light in others. Using
`text-ink-primary` on the sidebar once produced a 1.00:1 contrast ratio in one
theme — text the exact colour of its own background.

### Contrast

Body text must reach 4.5:1 against whatever it sits on. This is checked, not
assumed: two status colours were found at 3.00:1 and 4.08:1 and were darkened.
When adding a colour, check it against every theme's surfaces — a value that is
fine on three can be unreadable on the fourth.

---

## Adding to the system

**Prefer an existing token.** A new one is justified when there is a *kind of
thing* the scale cannot express, not when a value would look slightly better.
"I need 10px" is not a new token; "menus need a different elevation from cards"
is.

**Put it in the right layer.** Does it change between light and dark? Theme
token, in `tokens.js`, in all four. Otherwise a system token in `theme.css`.

**Check Tailwind generates from that namespace.** `--radius-*`, `--text-*`,
`--shadow-*`, `--spacing-*`, `--ease-*`, `--color-*` do. `--size-*` and
`--duration-*` do not — they produce nothing, silently, and the element renders
at its content height while everything looks fine in the source.

`src/theme/__tests__/designTokens.test.js` holds this line for the primitives
that define the visual language. It fails when one of them reintroduces a raw
radius, a raw shadow, or an ad-hoc pixel size.

---

## What is not covered yet

74 of 117 source files are fully on the scale. The other 43 are listed in
`NOT_YET_ON_THE_SCALE` in the token test, and every file not on that list is
checked — so a new component is governed the day it is written.

**The list only shrinks.** What is on it is there for one reason: those files
hold values the scale has no equal for.

| Still raw | Why it was not swapped |
|---|---|
| `rounded-md` (26 files) | 6px; `rounded-control` is 8px |
| `rounded-sm` (1 file) | 4px; the scale has nothing that small |
| `shadow-sm/md/lg/xl/2xl` (23 files) | No token matches any of them |

Every swap that *was* applied — 314 of them — was measured in a browser first
and only applied where the computed value was identical, so the migration
changed nothing on screen. These remaining ones cannot clear that bar: moving
them changes what renders, which makes each a design decision to take
deliberately rather than a swap to apply in bulk.

The shadows are the interesting group. Components disagree about elevation
today — a context menu at `shadow-xl`, a dropdown at `shadow-2xl`, a card at
`shadow-sm` — and that disagreement is exactly what `raised`/`floating`/
`overlay` exist to settle. Settling it means picking, and picking changes
something. Worth doing; worth doing on purpose.
