# PlatformCon Day Planner

The PlatformCon Sydney 2026 schedule as a small, phone-first web app. It is built by a team of
[kora](https://github.com/runkora/kora) agents working a Trello board, from story to merged pull
request, as a demo of what kora can run.

```bash
npm ci
npm test -- --run
npm run dev
```

The `layout` check opens the built app in Chromium at 393 and 1440 px, light and dark, and checks for sideways scroll, a visible focus ring and 44 px touch targets.
Run it locally with `npx playwright install chromium` once, then `npm run test:layout`.
Screenshots land in `test-results/layout/`, and CI uploads them as the `layout-screenshots` artifact.

Schedule data comes from the published agenda at [sydney.platformcon.com](https://sydney.platformcon.com/).

## Live data

`public/data/trains.json` and `public/data/lunch.json` are written by two kora agents, Sydney trains and lunch, through pull requests on `agent-trains` and `agent-lunch`.
Each pull request may change only its own file, which the `data-scope` check enforces, and the tester agent merges it once `test` and `data-scope` pass.
`trains.json` is `{ updated, status: "normal" | "disruptions", lines: [{ line, summary }], more, attribution }`.
`lunch.json` is `{ updated, place, picks: [exactly three { name, kind, cuisine, distance_m, street, lat, lon, reason }], attribution }`.
The app reads both at runtime through `loadFeeds` in `src/feed.ts`, which checks each shape.
Train data is from Transport for NSW Open Data under CC BY 4.0, and lunch data is from OpenStreetMap contributors under ODbL.
Never edit either file by hand.
