# Architecture

## Execution contexts

| Context | Entry | Role | Can access |
| --- | --- | --- | --- |
| Content script | `src/content/index.ts` → `dist/content.js` (IIFE) | Detects the page, reads the game DOM through the adapter, mounts the OGCC UI | OGame DOM, `chrome.storage`, messages to the SW |
| Service worker | `src/background/service-worker.ts` → `dist/background.js` (ES module) | Owns IndexedDB, answers typed messages | IndexedDB (extension origin) |
| Popup | `popup.html` → `src/popup/main.tsx` | Settings + status, safety valve to switch Modern UI off | `chrome.storage`, messages to the SW |

**Why a service worker?** A content script's IndexedDB belongs to the *page* origin
(`sXXX-yy.ogame.gameforge.com`): one database per universe, readable by page scripts, wiped
with site data. The SW has the extension origin, so historical data lives there and the
content script reaches it through `shared/messaging.ts`. The SW never contacts OGame.

## Layers

```
 OGame page ──► ogame/ (adapter: URL, selectors, parsers) ──► domain/ types
                                                                  │
          storage/ (preferences, IndexedDB) ◄── analytics/ (pure functions, to come)
                                                                  │
                                  ui/ (React, receives parsed data only)
```

- **ogame/** is the only code that knows OGame. `selectors.ts` centralises selectors,
  `parsers/` are pure functions returning `null` when data is missing or ambiguous.
- **domain/** holds DOM-independent business types (`Coordinates` today; `Planet`,
  `Resources`, `EmpireSnapshot`… as phases need them).
- **storage/** — see `docs/storage.md`.
- **analytics/** will hold pure calculation functions (production, ETA, ROI, expedition stats).
- **ui/** never parses the game DOM; `content/` passes it already-extracted data.
- **shared/** — logger, i18n, feature flags, typed messaging, time helpers.

Folders are created when a phase needs them, not up front.

## Content script lifecycle

1. Exit if in an iframe, if the URL is not a game page, or on `page=standalone` / `ajax=1`.
2. Load preferences, apply debug level and the Classic/Modern marker, subscribe to changes
   (changes from the popup apply live).
3. Read diagnostics (meta tags), mount `<ogcc-root>` with an open Shadow DOM, render React
   under an `ErrorBoundary`.
4. Any exception is logged and swallowed: OGame keeps working.

No MutationObserver yet. When one becomes necessary (Phase 1+), it must observe the
narrowest stable node, be debounced, and be disconnected on cleanup.

## Build

Two Vite (v8, rolldown) builds orchestrated by `scripts/build.mjs`:

- `vite.config.ts` — popup + service worker (ES modules, shared chunks allowed);
- `vite.content.config.ts` — content script as a single IIFE (MV3 content scripts cannot be
  ES modules); the design-system CSS is imported with `?inline` and injected in the shadow root.

`public/manifest.json` is copied as-is. `npm run dev` = both builds in watch mode.

## Dependencies

| Package | Why |
| --- | --- |
| react, react-dom | OGCC UI |
| idb | ~1 kB typed promise wrapper over IndexedDB, clean versioned upgrades |
| tailwindcss, @tailwindcss/vite | design system tokens + utilities, tree-shaken |
| vite, @vitejs/plugin-react | build |
| vitest, jsdom, fake-indexeddb | unit tests (DOM parsers, migrations) without a browser |
| eslint, typescript-eslint, eslint-plugin-react-hooks | lint |
| typescript `~6.0` | pinned: typescript-eslint does not support TS 7 yet |
