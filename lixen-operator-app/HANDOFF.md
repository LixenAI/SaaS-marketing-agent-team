# Lixen.AI Marketing Agent OS — Operator App Handoff

## Project path
`/home/user/workspace/lixen-operator-app`

Stack: React + Vite + Express + Tailwind + shadcn/ui (fullstack webapp template). Hash routing (wouter `useHashLocation`).

## Build / start commands
- Install: `npm install`
- Typecheck: `npm run check`
- Build: `npm run build`  (Render build command: `npm install && npm run build`)
- Start (prod): `npm start`  → `NODE_ENV=production node dist/index.cjs` on `PORT` (default 5000)
- Dev: `npm run dev`

## Operator token / preview behavior
- Protected endpoints require `Authorization: Bearer <token>`.
- Token source: `process.env.OPERATOR_TOKEN`. If unset, a documented, non-secret preview
  fallback is used: **`lixen-operator-preview`** (`server/routes.ts`). Set a real
  `OPERATOR_TOKEN` in Render for production.
- Verified: no token → 401, wrong token → 401, preview token → 200, env-set token replaces fallback.
- Token lives in React state only (`client/src/lib/operator.tsx`). No localStorage / sessionStorage /
  indexedDB / cookies anywhere.

## Modules
Dashboard, Agent Library, Autopilot Engine, Workflow Launch, Integrations, Audit Log.
Full-app login gate: before unlock, only the branded sign-in renders — even on deep hash routes
(e.g. `#/integrations`). Verified.

## Backend API (all require Bearer token)
- `GET /api/status` — auth check + app metadata, reports `usingPreviewFallbackToken`.
- `GET /api/catalog` — 26 assets ingested from the repo (agents, workflows, templates, QA, config, examples).
- `GET /api/integrations` — boolean env status only (never values) + non-secret defaults for the Render block.
- `GET /api/autopilot` — auto / approval / blocked queues.
- `GET /api/audit` — seeded audit timeline.

## Source ingestion
Catalog generated from `https://github.com/LixenAI/SaaS-marketing-agent-team` (Markdown + YAML).
Output committed at `server/catalog.json` and copied to `dist/catalog.json` at build time.
26 items: Agents 7 (incl. 3 README-referenced but missing files, flagged `seeded`), Workflows 4,
Templates 6, QA/Checklists 3, Config/Constraints 4, Examples 2.

## Autopilot safety lanes
- Auto: read / check / draft / report.
- Approval: send / publish / spend / enroll / CRM writes.
- Blocked: credentials (e.g. token rotation) and safety blockers (cold outreach via GHL, bulk enroll + live SMS).

## Safety boundaries in UI copy
- Cold outreach lane: Apollo / Instantly only; never cold outreach through GHL.
- Warm CRM lane: GHL LeadConnector Email only.
- No bulk enrollment / workflow publishing / live test messages / SMS / ad-spend changes without explicit approval.

## Render environment variables
```
OPERATOR_TOKEN=<set a private app password>
GHL_LOCATION_ID=C7e7ReTQ4FXMZp9TjxzU
GHL_PRIVATE_INTEGRATION_TOKEN=<HighLevel private integration token>
GHL_API_BASE_URL=https://services.leadconnectorhq.com
GHL_API_VERSION=2021-07-28
GHL_OPPORTUNITIES_API_VERSION=2023-02-21
LIXEN_CUSTOM_DOMAIN=marketing-agent.lixenai.com
LIXEN_BOOKING_LINK=https://link.lixen.ai/widget/booking/W0BVrWmszScBAjQhN631
LIXEN_SUPPORT_EMAIL=support@lixen.ai
```
Render steps (also shown in-app on the Integrations page):
1. Create a Render Web Service from this project.
2. Build Command `npm install && npm run build`; Start Command `npm start`.
3. Add the env vars above; set a strong `OPERATOR_TOKEN` — do not leave blank.
4. Point `marketing-agent.lixenai.com` at the Render service.
5. Verify `GET /api/status` returns 200 with the token; confirm no required var is blank
   (blank required vars were a prior cause of 500/401 errors).

## Brand
Navy #0D3070, blue #1E5BA8, light blue #60AAFF, tint #EBF2FA, bg #F5F5F5, text #333333, white #FFFFFF.
Custom inline SVG logo (`client/src/components/Logo.tsx`) + favicon (`client/public/favicon.svg`).

## Tests run
- `npm run check` (tsc): clean.
- `npm run build`: clean, no warnings; `dist/catalog.json` shipped.
- API: 401 (none/wrong), 200 (preview), env override verified.
- Playwright: login gate on deep route, wrong-token error, unlock, all 6 routes, stage toast,
  logout → gate, mobile drawer + responsive layout.
- Deployed preview verified unlocking against live backend (26 assets loaded via port proxy).

## Known limitations
- Data is static/seeded (catalog + autopilot + audit). No live GHL/Apollo/Instantly calls are wired —
  this is an operator console scaffold, not the execution engine.
- Audit log and staged-workflow state are in-memory and reset on server restart; no DB persistence.
- The deployed preview's API works only while the local prod server on port 5000 is running.
- 3 agents in the README roster have no source file; shown as `seeded` placeholders.

## Follow-up conventions for edits
- New page: add to `client/src/pages/`, register a `<Route>` in `client/src/App.tsx`, add a nav item in
  `client/src/components/Shell.tsx`. Keep `<Router hook={useHashLocation}>` — never path routing.
- Data: extend static data in `server/routes.ts`; re-run `/tmp/build_catalog.py` to regenerate
  `server/catalog.json` from the repo. Always `copyFile` keeps catalog in `dist/`.
- Auth: all new API routes must use the `requireOperator` middleware; all client fetches use
  `operatorGet(url, token)` (sends Bearer). Never read secret values into responses.
- Never use browser storage for tokens or any state — React state/context only.
- After any change: `npm run check && npm run build`, restart prod server on 5000, re-deploy with the
  same `project_path` to update the preview.
