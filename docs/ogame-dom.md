# OGame DOM and URLs — what we know

Rule: nothing below may be treated as fact unless its status is **VERIFIED** (with a date).
Everything **UNVERIFIED** must be confirmed on a real page before a feature depends on it.
All selectors live in `src/ogame/selectors.ts`.

## URLs

| Item | Value | Status |
| --- | --- | --- |
| Game host | `s{number}-{community}.ogame.gameforge.com` | UNVERIFIED (well known) |
| Game pages | `/game/index.php?page=ingame&component={view}` | UNVERIFIED |
| Stand-alone windows | `page=standalone&component=…` (e.g. empire) | UNVERIFIED |
| Legacy form | `page={view}` | UNVERIFIED, supported defensively |
| Lobby | `lobby.ogame.gameforge.com` — ignored by OGCC | — |

Component names assumed by `page-detector.ts` (`KNOWN_VIEWS`): overview, supplies,
facilities, lfbuildings, lfresearch, research, shipyard, defenses, fleetdispatch, movement,
galaxy, empire, alliance, messages, highscore — **all UNVERIFIED**. An unknown component is
reported as `unknown` with its raw value kept, never guessed.

→ To verify during Phase 1: open each game menu entry and note the exact URL.

## `<meta name="ogame-*">` tags

`selectors.meta` lists 11 tag names documented by the community tooling ecosystem
(`ogame-universe`, `ogame-player-id`, `ogame-planet-coordinates`, …). **UNVERIFIED.**
With debug mode on, the OGCC panel shows how many were found on the current page
(`Métadonnées OGame: x/11`) — a quick way to check.

Fixture: `src/ogame/__fixtures__/head-meta.synthetic.html` (SYNTHETIC).

## Needed for Phase 1 (Overview)

Please capture, from a real Overview page, anonymised:

1. the full `<head>` (meta tags);
2. the resource bar (metal, crystal, deuterium, energy, dark matter) and its tooltips;
3. the planet list (right column), including one moon if any;
4. the overview centre (planet info, construction/research/shipyard/lifeform queues);
5. the left menu;
6. the element ids/classes OGLight adds, to avoid colliding with them.
