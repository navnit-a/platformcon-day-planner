# PlatformCon Day Planner

A small web app for attendees of PlatformCon Sydney on Wednesday 28 October 2026: the day's schedule,
what is on now and next, and a personal agenda. It is built card by card by a team of agents working
the kora factory Trello board, and reviewed and tested by them before anything merges.

## Run it

```bash
npm ci
npm test -- --run
npm run dev
```

`init.sh` does the first two and must pass before you change anything.

## How work happens here

- One Trello card is one branch and one pull request, named after the card.
- Read the card, its comments and the code before writing anything; post a short plan as a comment.
- Tests first: one failing test per acceptance criterion, then the code that makes it pass.
- Test what a person sees. Query the page by role and label with Testing Library, never by CSS class
  or internal state. Name tests after behaviour ("shows the next session when one starts soon").
- Only what the card asks. No new dependency unless the card needs it and the PR says why.
- No comments in code; clear names and small functions instead.
- Conventional Commits: `feat: …`, `fix: …`, with a body that says why.
- The PR description says what changed, why, and how it was tested, in a few plain lines.

## Definition of Done

Tests written and passing, `npm run lint` clean, `npm run build` working, CI green on the PR, every
acceptance criterion checked one by one, the UI following `DESIGN.md`, the PR merged, and the card in
Done with a comment saying what shipped.

## Design

`DESIGN.md` is the design direction. Adapt it to the screen you are building, keep new work consistent
with what is already here, and make a good decision where it says nothing. Phone first: attendees open
this on a phone in a busy foyer.

## Data

`src/data/schedule.json` is the published PlatformCon Sydney agenda (sydney.platformcon.com, read
25 October 2026). Times are Sydney local time. Do not invent sessions.
