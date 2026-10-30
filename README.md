# Internet Invitational 2026 Tracker

A fan-made companion app for the 2026 Internet Invitational: standings, team rosters, every match result, and a bracket-style explanation of the format. Mobile first, installable as a PWA, and updated by hand after each episode (Mondays and Thursdays, 1pm ET).

Built with Vite, React and TypeScript. No backend: all data lives in `data/tournament.json` and is bundled at build time.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm test          # scoring unit tests (Vitest)
npm run build     # typecheck + production build into dist/
npm run preview   # serve the production build
```

## Project layout

| Path | What it is |
|---|---|
| `data/tournament.json` | Source of truth for teams, matches, episodes and stages |
| `src/lib/scoring.ts` | Pure functions: match points, session and contest totals, player records, `½` formatting |
| `src/lib/scoring.test.ts` | Tests (FR is 8–8, DB is 5½–10½, playoffs don't count) |
| `src/content.ts` | Editorial words that aren't in the JSON (board stories, bracket blurbs) |
| `src/screens/` | Standings, Teams, Matches, Format & Bracket |
| `public/` | PWA manifest, service worker, icons |
| `reference/prototype.html` | The original single-file prototype |

Routes: `/standings`, `/teams/:team`, `/matches?player=Big%20John&session=2&matchup=FR`, `/format`. Every view is a shareable link.

## Add a new episode's results

Results come from <https://ytgolfstats.com/internet-invitational/2026/>.

1. **Matches.** Append the new matches to `matches[]` in `data/tournament.json`. Give them a new `session` key (for example `"3"`) and add that key to `sessions` with its label, format and hole count. A playoff session gets `"countsTowardPoints": false`.
2. **Day 2 teams.** Day 2 likely re-drafts players into new teams. Add a new structure (for example `day2Teams`) instead of changing the Day 1 `teams`, which are history.
3. **Episode + stage.** Flip the episode's `status` to `"released"` and give it a `summary`. Set the stage to `"status": "complete"`, `"confirmed": true`, with real `format` text. Bump `meta.updatedThrough` and `meta.updatedAt`.
4. **Words.** Update `src/content.ts` if a story line or bracket blurb changed, and add any new `moments`.
5. **Check and ship.** `npm test && npm run build`, then push to `main`. Vercel deploys automatically.

Scores, records, standings and "up next" are all computed, so you never type a total by hand.

## Deploy to Vercel

The repo is a plain Vite static site, and `vercel.json` rewrites every route to `index.html` so deep links work.

1. In Vercel, **Add New → Project**, import this GitHub repo.
2. Framework preset: **Vite** (build `npm run build`, output `dist`). No environment variables.
3. Deploy. Every push to `main` redeploys production; other branches get preview URLs.

## Icons

`public/icons/icon.svg` is the source. Regenerate the PNGs with `npm run icons` (needs Playwright; with a global install run `NODE_PATH=$(npm root -g) npm run icons`).
