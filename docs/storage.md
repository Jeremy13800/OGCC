# Storage

## Preferences — `chrome.storage.local`

- Key `ogcc:preferences`, shape `Preferences` in `src/storage/preferences.ts`
  (`schemaVersion`, `features`, `appearance`, `developer`).
- Readable/writable from the content script and the popup; `chrome.storage.onChanged`
  propagates changes live to every open tab.
- Everything read goes through `sanitizePreferences()`: unknown keys dropped, wrong types
  replaced by defaults, missing keys filled. A corrupted value can never break OGCC.
- Bump `PREFERENCES_SCHEMA_VERSION` only if a field changes meaning; adding a field only
  needs a default.

## Historical data — IndexedDB (`ogcc` database)

- Opened **only in the service worker** (extension origin). See `docs/architecture.md`.
- `src/storage/database.ts`:
  - `OgccDBSchema` describes the latest schema;
  - `MIGRATIONS` is append-only, versions 1, 2, 3… without gaps (asserted at open time);
  - on open, only migrations with `oldVersion < version <= newVersion` run, inside the
    upgrade transaction;
  - an open connection closes itself on `versionchange`, so an extension update is not blocked.

| Version | Change |
| --- | --- |
| 1 | `meta` store (keyPath `key`) |

Planned: `snapshots` (Phase 4, with dedup by content hash + minimum interval),
`expeditions` (Phase 6, keyed by a fingerprint of the report), `goals` (Phase 5).

## Adding a store

1. Add it to `OgccDBSchema`.
2. Append a migration creating it (and its indexes).
3. Add a test in `database.test.ts` upgrading from the previous version with data inside.
4. Add a line to the table above.
