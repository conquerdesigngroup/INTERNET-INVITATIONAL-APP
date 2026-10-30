# Internet Invitational 2026 Tracker: App Spec

An interactive companion app for the 2026 Internet Invitational, the creator golf tournament from Barstool Sports and Bob Does Sports. It shows teams, captains, every match result, standings, and a bracket-style explanation of the format. It is updated after each episode, which drop Mondays and Thursdays at 1pm ET.

`reference/prototype.html` is a working single-file version of everything below. Open it in a browser to see the intended behavior and look. The app should match it feature for feature, then improve on it.

## Stack (default)

- Vite + React + TypeScript
- Plain CSS modules or a single tokens stylesheet. No UI kit needed.
- Data: `data/tournament.json`, imported at build time. No backend for v1.
- Installable PWA (manifest + service worker) so it works like an app on a phone.
- Deploy target: Vercel (static build).

Swap any of these if you prefer. The data file and the spec are stack-agnostic.

## Data model (`data/tournament.json`)

| Key | What it holds |
|---|---|
| `meta` | Event name, venue, host, rules official, prize totals, bonuses, sources, `updatedThrough` |
| `episodes[]` | Number, date, 1pm ET release, `released` or `upcoming`, short summary |
| `sessions` | `"1"` scramble, `"2"` alternate shot, `"P"` playoff (`countsTowardPoints: false`) |
| `matchups` | `FR` = Finch (home) vs Ruffels (away); `DB` = Dalke (home) vs Bryan (away) |
| `matchupOutcomes` | Winner of each Day 1 contest and how it was decided |
| `stages[]` | Draft → Day 1 → Day 2 → Semifinal → Final. `confirmed: false` stages carry `expectedFrom2025` text |
| `teams[]` | `id`, name, captain, color (Green/Red/Blue/White), status, 16 players with `handicap` (string, `+` = better than scratch, `null` = unknown) and `isCaptain` |
| `matches[]` | `id`, `session`, `matchup`, `home`/`away` (`team` + 2 players), `result` (`Halved`, `1UP`, `4&3`, `Won`…), `winner` (`home`/`away`/`halved`), optional `note` |
| `moments[]` | Short storyline cards |

### Derived values (compute, never hard-code)

- Match points: win = 1, halved = 0.5 each side. Playoff matches (`session: "P"`) do not count.
- Session totals per matchup, and contest totals. Current correct values: FR 8–8 (Ruffels won the playoff), DB 5.5–10.5.
- Player record: ordered list of W/H/L across non-playoff matches, plus points.
- Display halves as `½` (e.g. `10½`).

Write unit tests for these. They are the core logic.

## Screens

1. **Standings** (home)
   - One scoreboard per Day 1 contest: both teams, totals, a 16-point split bar, a session-by-session table, Advanced/Eliminated badges, a one-line story.
   - Prize facts strip ($4M, about $1.3M per winner, $500K Reese's ace, $5K CTP bonus, no handicaps).
   - "Who's still alive": all four rosters, eliminated teams dimmed. Tapping a name opens Matches filtered to that player.
   - Episode schedule with released / up next / upcoming states (compute "up next" from today's date).
   - Moments cards.
2. **Teams**
   - Team switcher (remember last choice locally).
   - Header: captain, color, outcome line, Day 1 points, matches won, status.
   - Roster table: player, handicap, record chips, points, status. Row tap opens that player's matches.
3. **Matches**
   - Filters: session, matchup, player search. Reset button.
   - Grouped by session + matchup, with the group's score in the heading.
   - Card: home pair | result pill colored by winning team | away pair. Losing side muted. Optional note below.
   - Tapping a player name filters to that player.
4. **Format & Bracket**
   - Horizontal bracket: 4 team nodes → 2 Day 1 nodes → Day 2 → Semifinal → Final.
   - Connector lines: solid accent = advanced, dashed grey = eliminated, dotted gold = not aired yet. Lines draw in on first view (respect reduced motion).
   - Tapping a node shows a detail panel below.
   - Explainers: scramble diagram, alternate-shot diagram, and a result decoder (pick `4&3` → highlights which of the 9 holes were played and explains it, plus how many times that result happened).
   - Footnote that later stages are based on 2025 until they air.

Routing: one URL per screen (`/standings`, `/teams`, `/matches?player=Big%20John`, `/format`) so links are shareable.

## Design

Match the prototype: a manual tournament-leaderboard feel.

- Fonts (Google Fonts): Big Shoulders Display (headings, scores), Public Sans (body), JetBrains Mono (results, numbers, tabular figures).
- Team colors: Bryan green `#1E8A4C`, Dalke red `#C7362C`, Finch blue `#2A5FC4`, Ruffels white `#FFFFFF` with a dark outline.
- Light and dark themes. Token values are in the `:root` blocks of `reference/prototype.html`; copy them.
- Sticky fairway-green header band and tab bar. Mobile-first; the bracket scrolls sideways on phones.

## Updating after each episode

This is a fan tracker, so results are entered by hand from https://ytgolfstats.com/internet-invitational/2026/.

1. Add the new matches to `matches[]` with a new `session` key (for example `"3"`), and add that session to `sessions`.
2. Day 2 likely re-drafts players into new teams. Add a `rounds` or `day2Teams` structure rather than changing the Day 1 `teams` data. The Day 1 teams are history.
3. Flip the episode to `released`, set the stage to `confirmed: true` with real format text, and bump `meta.updatedThrough`.
4. Run tests, then deploy.

A `scripts/` helper or an admin form that validates new entries (each player exists, two per side, winner matches result) is a good v2 addition.

## Nice-to-haves (v2)

- Spoiler shield: hide results for episodes the viewer hasn't watched.
- Player pages with bio, handicap, and match history.
- Skins tracking for Day 2 (2025 paid a per-hole skin).
- Push notification when a new episode drops.
- A small importer that reads the YT Golf Stats page and proposes JSON updates for review.
