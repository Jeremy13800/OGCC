# Design system

Goal: "OGame if it were designed today" — deep space, night blue, cyan technology, metal;
a strategic command centre. Not a generic SaaS dashboard, not a banking app.

Source of truth: `src/styles/ogcc.css` (Tailwind v4 `@theme`). The default Tailwind palette,
type scale, radii and shadows are **reset**: only OGCC tokens exist.

## Tokens

| Group | Tokens | Use |
| --- | --- | --- |
| Backgrounds | `space-950`, `space-900` | page / deepest layer |
| Surfaces | `surface-900` → `surface-600` | panels, from deepest to most raised |
| Lines | `line`, `line-strong` | 1px borders, dividers |
| Text | `fg`, `fg-muted`, `fg-subtle` | primary (15.7:1) / secondary (8.7:1) / metadata (5.5:1) on `surface-900`. `fg-subtle` drops to 4.1:1 on `surface-600`: keep it on deep surfaces |
| `tech` (cyan) | | technological information, active states |
| `action` (light blue) | | interactive elements, links |
| `positive` / `warning` / `danger` | | available / attention / danger |
| `special` (violet) | | rare special functions only |
| Resources | `metal`, `crystal`, `deuterium`, `energy`, `darkmatter` | reserved for Phase 1 |

- **Sizes are px** (`--spacing: 4px`, text 11–24px): inside OGame, rem would follow the
  game's root font-size.
- **Radii**: `xs 2`, `sm 4`, `md 6`, `lg 8` px — moderate, technical.
- **Shadows**: `panel` (soft depth), `glow` (cyan focus/highlight, sparingly).

## Typographic hierarchy (utilities)

| Utility | Role |
| --- | --- |
| `ogcc-title-planet` | planet / page title |
| `ogcc-section-title` | uppercase section label |
| `ogcc-value` | numeric value (mono, tabular figures) |
| `ogcc-label` | field label |
| `ogcc-meta` | metadata, hints |

## Surfaces

`ogcc-surface`: subtle vertical gradient, 1px line border, soft shadow, light blur.
No heavy glassmorphism.

## Components (`src/ui/components`)

`Switch` (role=switch, label/hint wired), `Badge`, `StatusDot` (always paired with text),
`Section`, `ErrorBoundary`.

## Motion

Short (≤160ms), `ease-snappy`. Disabled by the *Animations* setting
(`data-ogcc-animations="off"`) and by `prefers-reduced-motion`.

## Isolation

- OGCC UI lives in `<ogcc-root>` (custom tag + inline `all: initial`) with an open Shadow DOM:
  page CSS (OGame, OGLight) cannot leak in, OGCC CSS cannot leak out.
- Base typography is applied on `[data-ogcc-app]` inside the shadow root, because the host's
  inline `all: initial` overrides `:host` rules.
- Chrome ignores `@property` inside shadow roots; `ui/theme/shadow-styles.ts` re-declares
  Tailwind's `--tw-*` initial values in a lowest-priority layer instead of touching the page.
- Modern UI page styling (Phase 1+) must be scoped under `html[data-ogcc-theme="modern"]`.

## Fonts

System stack for now (Inter / Segoe UI / system-ui). Bundling a font requires declaring
`@font-face` at document level (not supported inside shadow roots) — deferred.
