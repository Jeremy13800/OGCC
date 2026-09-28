# AGENTS.md — permanent instructions for AI agents

OGame Command Center (OGCC) is a Chrome MV3 extension adding a modern UI, an empire
dashboard and analytics on top of OGame. Read this file entirely before any change.

## Priorities (in this order)

1. OGame account safety  2. game-rules compliance  3. stability  4. OGLight compatibility
5. maintainability  6. performance  7. UX  8. aesthetics  9. number of features.

## Hard rules

- **No gameplay automation, ever.** OGCC observes, computes, stores, displays and advises.
  It never sends fleets, starts builds/research, attacks, spies, buys/sells, clicks game
  actions or fires repeated game requests. Read `docs/compliance.md` before any feature
  touching game actions. When in doubt, don't — and ask.
- **Never invent the OGame DOM.** If a page structure is unknown, ask the user for the real
  HTML, or write a clearly labelled `SYNTHETIC` fixture and mark selectors `UNVERIFIED`.
  Status of every known selector: `docs/ogame-dom.md`.
- **All data stays local.** No telemetry, no external analytics, no remote calls, no accounts.
- **OGame must keep working if OGCC fails.** Guard boundaries with try/catch, React tree
  under `ErrorBoundary`, never throw out of the content script.
- **No `any`, `@ts-ignore`, `@ts-nocheck`, `eslint-disable`** (unless exceptionally justified
  in a comment). Fix the cause. TypeScript stays strict.
- **No `innerHTML`** (lint-enforced), no execution of untrusted HTML.
- **No git push / force push / branch deletion / destructive reset or rebase.** Commit only
  when asked, format `type(scope): summary` (e.g. `feat(ui): …`, `fix(storage): …`),
  author = the user only, never add an AI co-author line.

## Architecture (details: `docs/architecture.md`)

```
src/
  background/   service worker — owns IndexedDB, answers typed messages
  content/      content script — bootstrap, Shadow DOM mount, page-level theme switch
  ogame/        OGame ADAPTER — the only code that knows OGame (URL, DOM, number formats)
    selectors.ts  every DOM selector lives here, nowhere else
    parsers/      pure functions: DOM/text → domain types, return null when unsure
    __fixtures__/ anonymised HTML (SYNTHETIC or CAPTURED, see its README)
  domain/       business types, no DOM
  storage/      chrome.storage preferences + versioned IndexedDB (migrations)
  analytics/    (to come) pure calculation functions, testable without a browser
  ui/           React components — never read the OGame DOM
  popup/        toolbar popup (settings + safety valve)
  shared/       logger, i18n, feature flags, messaging, time helpers
  styles/       design system (Tailwind v4 tokens)
```

Dependency direction: `ui → domain/shared`, `content → ogame + ui + storage`,
`ogame → domain/shared`. React components receive already-parsed data.

## Conventions

- **Namespace everything** that touches the page: tag `ogcc-root`, attributes `data-ogcc-*`,
  classes `ogcc-*`, storage keys `ogcc:*`. OGCC UI renders inside a Shadow DOM.
  Page-level styles (Modern UI) must be scoped under `html[data-ogcc-theme="modern"]` so that
  removing the attribute restores Classic instantly.
- **OGLight coexistence**: never depend on OGLight's DOM, never override its ids/classes,
  never monkey-patch globals. Must work with and without OGLight. Don't re-implement what
  OGLight already does well.
- **Performance**: no MutationObserver on `document`/`body` subtree; observe the narrowest
  node, debounce, disconnect on cleanup. No polling of game endpoints.
- **Parsing**: prefer ids, data attributes, meta tags, numeric values; never translated text;
  never `parseFloat` on game text → `ogame/parsers/numbers.ts`. Missing data → `null`,
  displayed as N/A. Approximations must be labelled as such.
- **Durations/dates** → `shared/time.ts`. **Logs** → `shared/logger.ts` (no `console.*`).
- **UI text** → `shared/i18n/fr.ts` (French reference), never hard-coded strings.
- **Sizes in px** in the design system (rem would follow OGame's root font-size).
- **Feature flags** (`shared/features.ts`): every module is gated; a `planned` module is
  shown disabled in Settings.
- **IndexedDB** only from the service worker (content-script IndexedDB belongs to the OGame
  origin). Schema changes = a NEW migration appended in `storage/database.ts` + test.
- Tests next to the code (`*.test.ts`). Test what has value: parsers, calculations,
  migrations, fingerprints — not trivial rendering.

## Working method

1. Inspect before modifying: read this file, the files involved, similar existing code.
   Never assume a file's content.
2. For significant tasks: summarise understanding, files, short plan, risks — then implement.
3. Minimal, targeted changes. No unrelated refactors, no renaming by preference, no scope creep.
4. Follow the phase plan (README "Roadmap"); one phase at a time, each leaves a working extension.
5. After each change run and fix: `npm run typecheck`, `npm run lint`, `npm test`,
   `npm run build`. Verify instead of saying "it should work". Summarise the diff.
