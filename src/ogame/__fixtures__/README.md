# OGame HTML fixtures

Minimal, anonymised HTML excerpts used to test the parsers without a live server.

Each fixture starts with a comment stating its origin:

- `SYNTHETIC` — written by hand from assumptions. The parser it feeds is **not** proven
  against the real game until the fixture is replaced by a real excerpt.
- `CAPTURED <date> <game version>` — copied from a real page, then anonymised
  (player names, ids, alliance tags, coordinates replaced by fake values).

Never commit a fixture containing real player data.
