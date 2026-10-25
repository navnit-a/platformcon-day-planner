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
