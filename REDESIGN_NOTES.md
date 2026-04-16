# LPMO Command Center — Frontend Redesign Notes

## Overview

Full-surface visual redesign of the LPMO Command Center. All data, routing, Supabase calls, and AppContext APIs are unchanged — only styling, layout, and presentational structure were rewritten. Both **light** and **dark** themes are supported via a persistent ThemeContext and CSS token system.

**Stack used:** React 19, TypeScript, Tailwind v4 (`@import "tailwindcss"`), Recharts, lucide-react, `react-router-dom`.

## Theme system

- `src/index.css` — Tailwind v4 entry with `@theme` font tokens plus a full token palette on `:root` and overrides on `.dark`. Tokens cover canvas/surface/subtle backgrounds, two border weights, three ink levels, an accent palette (coral / amber / teal / indigo / rose / sky, each with `solid` / `soft` / `ink`), status tokens (success / warning / danger), and shadows. Also includes `.lpmo-range` slider styling, Recharts overrides, `.focus-ring`, `.animate-pulse-slow`, `.animate-fadein`, `.card-hover`, `.tabular`, `.clamp-2`, `.clamp-3`.
- `src/context/ThemeContext.tsx` — `ThemeProvider` + `useTheme()`. Persists to `localStorage['lpmo-theme']`, toggles the `dark` class on `<html>`.
- `index.html` — preloaded Google Fonts (Inter / Fraunces / JetBrains Mono), inline script that applies the persisted theme pre-paint, `theme-color` = coral, title = LPMO Command Center.
- `public/favicon.svg` — coral L-monogram.

## UI primitives built (all in `src/components/ui/`)

| File | Purpose |
| --- | --- |
| `tokens.ts` | `AccentName`, `ACCENTS`, `ACCENT_VAR`, `STATUS_VAR`, `cn()` helper |
| `Logo.tsx` | Coral L-monogram, optional Fraunces wordmark |
| `Card.tsx` | `Card` + `CardHeader` (title / subtitle / icon / action) |
| `Button.tsx` | Variants primary / secondary / ghost / danger / soft; sizes sm/md/lg/icon; leftIcon/rightIcon/loading/fullWidth |
| `Chip.tsx` | `Chip` and `DeltaChip`; tones = AccentName \| StatusName \| 'neutral' |
| `Input.tsx` | `Input`, `Textarea`, `Select`, `Field` wrapper |
| `Avatar.tsx` | Initials with hashed accent; optional status dot |
| `StatTile.tsx` | KPI tile with label, value, unit, delta, sparkline, icon |
| `EmptyState.tsx` | Icon + title + description + optional action |
| `ThemeToggle.tsx` | Animated sliding switch (sun / moon) |
| `Sidebar.tsx` | 240px nav with per-item accent, active = accent-soft bg + left-bar, bottom user chip |
| `TopBar.tsx` | Sticky 64px, blur backdrop, breadcrumbs, title, search pill, bell, theme toggle, avatar |
| `Shell.tsx` | `<Sidebar/> + <TopBar/> + main + optional rightRail` layout |
| `ChartCard.tsx` | Card wrapper for Recharts widgets |
| `Tabs.tsx` | Generic `<Tabs<T>>` with tab objects { id, label, icon, count } |
| `Modal.tsx` | Size sm/md/lg/xl, escape-to-close, body-scroll-lock, footer slot |
| `RagDot.tsx` | `RagDot` + `RagChip` |
| `index.ts` | Re-exports everything |

## Pages redesigned (all 7)

Every page now uses `<Shell>` + primitives, fully themed, preserving all existing behavior:

1. **`pages/Dashboard.tsx`** — Donut gauge (PieChart), AreaChart with coral gradient, 4 KPI StatTiles with sparklines, ProgramCard grid, right rail with today's agenda + recent activity feed.
2. **`pages/BandwidthTracker.tsx`** — Week navigator card, capacity hero (big %, stacked bar, legend chips), pill BarChart, program sliders with per-program accent tint, focus notes textarea.
3. **`pages/WeeklyTracker.tsx`** — Week navigator, KPI tiles, timeline-style program roll-up (accent bar + RAG dot + summary + count chips + submitted state + per-row owner chip), right rail with manager notes textarea + brief preview.
4. **`pages/MeetingsHub.tsx`** — 4 KPI tiles, dropzone-style recording hero with live timer & stop button, meeting history list with status chips, right rail with search/filter + quick stats.
5. **`pages/WeeklyDigest.tsx`** — Magazine-style hero (Fraunces display type, metadata strip), 2×2 section cards (Wins / Risks / Blockers / Looking ahead), pull-quote styled Decisions block, full markdown fallback, right rail with week picker + recent digest list.
6. **`pages/ProgramDetail.tsx`** — Hero card with big Fraunces countdown badge, owner avatar, launch metadata strip, stakeholder chips; Tabs (Overview / Workstreams / Checklist / Knowledge / Meetings / Program Brain — tab IDs preserved: `overview`, `weekly-status`, `launch-readiness`, `documents`, `meetings`, `brain`). Overview has 4-column kanban + workstream list. Launch Readiness has an illustrated gate timeline with accent-colored nodes. Program Brain is a full chat UI with suggestion chips, streaming bubble animation, and source citations. **Every Supabase call, state variable, and CRUD interaction preserved verbatim.**
7. **`pages/Settings.tsx`** — Now has 6 tabs including a new **Appearance** panel that embeds the `ThemeToggle` and shows accent-color + typography samples. Connection-status chips in API Keys panel. Template cards are accent-colored. Export panel uses accent-bucket icons. Notifications use a custom accessible toggle switch.

## Supporting components redesigned

- `components/ProgramCard.tsx` — Type-accent tint, hover-reveal arrow, footer with owner avatar + countdown + overdue/unreviewed chips.
- `components/NewProgramModal.tsx` — Uses `Modal`, `Field`, `Input`, `Textarea`, `Select`, `Button`. Form submits via footer action.

## Files left untouched (intentionally)

- `src/context/AppContext.tsx` — data layer unchanged.
- `src/types/index.ts` — type shape unchanged.
- `src/lib/utils.ts`, `src/lib/supabase.ts` — unchanged.
- `src/components/Sidebar.tsx` (legacy) — still present, no longer imported by `App.tsx` but kept to avoid any unforeseen references.
- `src/pages/MeetingDetail.tsx` — not in the stated page list; left as-is.
- `src/App.css` and `src/styles/index.css` — emptied to a comment (no legacy rules fighting the new tokens).

## Build

`npm run build` passes cleanly (`tsc -b && vite build`). Only a chunk-size advisory is emitted (bundle is 942 KB un-split — expected; no functional issues). Fixed three pre-existing implicit-`any` errors in `pages/Dashboard.tsx` by adding explicit inline param types for `gatesWithDates.find` and `.filter` predicates.

## Key patterns & gotchas

- **CSS variables in inline styles**: `style={{ color: 'var(--ink-primary)' }}` — needed because Tailwind v4 arbitrary values can't read our tokens outside `@theme`.
- **Hover effects without `:hover` utilities**: use `onMouseEnter` / `onMouseLeave` handlers to swap background/border vars. Used throughout list rows.
- **Focus rings**: `focus-visible:ring-[3px]` plus a `.focus-ring` utility that sets `--tw-ring-color: var(--accent-ring)`.
- **Recharts colors**: pass `var(--coral-solid)` directly to `fill`/`stroke`; gradients defined in `<defs>` with stable IDs.
- **Page layout**: all pages now call `<Shell title … rightRail=…>` — no per-page `ml-64` / padding.
- **Avatar hashing**: deterministic initials color via char-code sum modulo accent count.

## Known issues / limitations

- Bundle is ~940 KB unsplit. Splitting is outside the scope of this visual redesign.
- `Sidebar.tsx` in `src/components/` (old) is orphaned but retained; safe to delete later.
- The AI generation flows in `MeetingsHub`, `WeeklyDigest`, and `ProgramBrain` remain simulated (unchanged from original) — only their UI was redone.
- `WeeklyTracker` keeps its local `weeklyStatuses` stub empty state; wiring to the Supabase-backed `useApp().weeklyStatuses` is out of scope (data shape preservation only).
