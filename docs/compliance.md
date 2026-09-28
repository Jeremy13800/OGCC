# Compliance — what OGCC never does

OGCC is a **reading and decision-support** tool. Account safety and game-rule compliance
come before any feature.

## Allowed

- Reading what the player's own browser already displays (DOM of pages the player opens).
- Computing, storing locally, displaying, advising.
- Restyling the interface and adding OGCC panels.
- Links or buttons that only **navigate** to a game page the player then uses manually.

## Forbidden

- Sending fleets, starting constructions/research/ships, attacking, spying, colonising,
  buying, selling — or pre-filling and submitting any game form.
- Simulating clicks or keyboard input on game actions.
- Issuing requests to game endpoints on the player's behalf, polling, or background
  fetching of pages the player did not open.
- Anything that keeps the player "active" or acts while the player is away.
- Sending player data anywhere (no remote server, analytics, telemetry, account).

## Review checklist for a new feature

1. Does it trigger any request to OGame that the player did not initiate? → reject.
2. Does it perform a game action, even with confirmation? → reject.
3. Does it read only what is displayed in pages the player opened? → OK.
4. Does data leave the machine? → reject (unless a future opt-in feature, explicitly
   consented and documented here).

When unsure, do not implement: ask the user and, if needed, check the official OGame rules.
