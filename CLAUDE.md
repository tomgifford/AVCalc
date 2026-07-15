# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

AVCalc ("POH Chart Companion") is a performance-calculator app for Piper PA-28 aircraft (Warrior I/II, Archer II). It digitizes lookup tables from the POH (Pilot's Operating Handbook) climb/cruise/engine/airspeed-calibration charts so pilots can get interpolated numeric answers instead of eyeballing a paper chart. It's a single Fastify process that serves a REST API, a React SPA, and an MCP server, all deployable as one Lambda container image.

Two npm workspaces:
- `app/` — React 18 + Vite SPA (frontend)
- `server/` — Fastify + TypeScript API, calculation engine, and MCP server (backend)

The repo root also has a legacy pre-React vanilla-JS version (`js/`, `css/`, `AvCalcMainApp.html`) — not part of the active app, kept for reference only. Don't edit it when working on features; the real app is `app/` + `server/`.

## Commands

Run from the repo root unless noted.

```bash
npm run dev            # Vite dev server (app), proxies /v1 to localhost:3000
npm run dev:server      # Fastify server in watch mode (tsx), from server/src/index.ts
npm run build           # Build the React app (app/dist)
npm run build:server    # tsc compile server (server/dist)
npm run start           # Serve built app via Vite preview
npm run start:server    # Run compiled server (node server/dist/index.js)
```

Local dev requires both running at once (server on :3000, Vite on :5173/:5174 proxying `/v1` to it — see `app/vite.config.js`).

Server-only commands (run from `server/`):
```bash
npm run lint            # eslint .
npm run test            # runs all scenario test scripts in sequence (see below)
npm run start:mcp       # stdio MCP server entrypoint (server/src/mcp.ts), for local MCP client testing
```

App-only commands (run from `app/`):
```bash
npm run lint
npm run deploy          # gh-pages -d dist (legacy/alternate static deploy path)
```

### Tests

There is no test runner/framework — tests are plain Node scripts under `server/test/` that print interpolated values next to hand-derived expected values from the POH charts, flagging `✗ LARGE ERROR` when the discrepancy exceeds a threshold (visual pass/fail, not asserts). Run an individual one directly, from `server/`:

```bash
node test/climb-scenario-test.js
node test/cruise-scenario-test.js
node test/engine-scenario-test.js
node test/airspeed-test.js
```

`npm run test` (in `server/`) runs all four in sequence. As of the last deployment writeup, `climb-scenario-test.js` has known pre-existing numerical-calibration discrepancies unrelated to any in-flight work — check the script's own comments before assuming a red result is a new regression.

Note: `app/test/` contains an older, largely duplicate copy of these same scripts plus chart-lookup HTML visualizations — the canonical/maintained copies are in `server/test/`.

When generating new data files or new data structures for our aircraft, generate test charts for me to visualize our data points. Follow the patterns established in app/test/*lookup-chart.html. These should always read from the associated data file, so that we validating that data at real-time. Before generating new files of this type, ask a clarifying question, but do not forget to ask if they should be generated.
Each new lookup-chart.html file should be added to app/test/index.html, under the appropriate aircraft type.

## Architecture

### Calculation engine (the core domain logic)

All flight-performance math lives in `server/src/lib/*-calc.js` (plain JS, not TS) and follows one shared pattern: **piecewise-linear interpolation over lookup tables** keyed by `yRef` (a normalized reference value derived from pressure altitude + temperature) or directly by pressure altitude/temperature. Each calc module (`climb-calc.js`, `cruise-calc.js`, `engine-calc.js`, `airspeedcal-calc.js`, `utility-calc.js`) exposes pure functions like `getClimbYRef(data, pa, T)` → `getDist/getTime/getFuel(data, yRef)`, each doing 2D linear interpolation across the same lookup-table shape (array of `{ pa, points: [{ t, yRef }] }` or `{ yRef, value }`). When adding a new calc, follow this interpolate-then-lookup pattern rather than inventing a new shape.

The underlying numeric tables (one file per aircraft per chart type, e.g. `pa28-161-climb-data.js`) live in `server/src/data/` and were manually digitized from POH chart images. Treat these as generated/authoritative data — don't hand-tune values without cross-checking against the actual chart (the `app/test/*-lookup-chart.html` files render the digitized points against the source chart images for visual verification).

**`server/src/lib/aircraft-registry.js`** is the single indirection point mapping an aircraft ID (`pa28-151` / `pa28-161` / `pa28-181`) to its four data modules. Any new aircraft must be registered here and added to `AIRCRAFT_LIST`; everything downstream (routes, MCP tools) looks aircraft data up through `getAircraftData(aircraftType)`.

### Three consumers of the same calc engine

The calc/data layer is consumed identically from three places — when changing calc behavior, all three need to stay in sync (or better, only the calc modules should change and all three benefit automatically):
1. **REST routes** (`server/src/routes/*.ts`) — one file per chart type (`climb.ts`, `cruise.ts`, `engine.ts`, `airspeed.ts`, `aircraft.ts`), all registered under the `/v1` prefix in `server/src/index.ts`.
2. **MCP tools** (`server/src/mcp/registerTools.ts`) — `createAvCalcMcpServer()` is a shared factory registering the same calculations as MCP tools (`calculate_climb`, `calculate_cruise`, `calculate_engine`, `calculate_airspeed`, `list_aircraft`, `get_aircraft_limits`). Used both by the stdio entrypoint (`server/src/mcp.ts`, for local MCP clients) and the HTTP transport (`server/src/routes/mcp.ts`, Streamable HTTP at `/mcp`).
3. **React app** (`app/src/App.jsx`) — calls the REST routes via `app/src/lib/api.js`, and separately renders the *source* POH chart images (via `app/src/lib/performance-charts.js`) alongside the computed numbers so the user can cross-check.

### Auth model (asymmetric by consumer)

- `/v1/*` (browser/REST): session-cookie based, set automatically on any HTML response (`onSend` hook in `index.ts`); validated on `/v1/*` requests only in production (`isProd` gate) — no real login flow, this just distinguishes "same browser as before."
- `/mcp`: separate, stricter bearer-token auth (`Authorization: Bearer <MCP_API_KEY>`), checked in `mcpRoutes`' `preHandler` hook — always enforced, not just in prod.
- Secrets (`SESSION_SECRET`, `MCP_API_KEY`) resolve via `server/src/lib/config.ts#loadSecrets()`: direct env var locally, or AWS SSM Parameter Store in production (`*_PARAM` env vars naming the SSM parameter). In prod, a missing session secret is a hard fail at boot.

### Serving model

The Fastify server does triple duty: it serves the `/v1` API, the `/mcp` endpoint, *and* the built React SPA as static files (`app/dist`, registered via `@fastify/static` with `wildcard: false` + a `setNotFoundHandler` that returns `index.html`, so client-side SPA routes resolve correctly). There's no separate frontend host in production — `npm run build` (app) + `npm run build:server` + `node server/dist/index.js` is the whole production deployment.

### Deployment (AWS Lambda, in progress)

The `Dockerfile`, `template.yaml` (SAM), and `AWSDeploymentNextSteps.md` describe an in-progress move to running this same Fastify process on Lambda (container image) behind API Gateway, using the AWS Lambda Web Adapter — chosen specifically to avoid rewriting the app around Lambda-native handlers. Read `AWSDeploymentNextSteps.md` before touching deployment config — it documents which steps are done vs. still manual (SSM secrets, `sam deploy`, budget alerts), and a real bug it hit (a `zod` version mismatch with `@modelcontextprotocol/sdk` causing `tsc` to OOM — pin `zod` to `^3.25.0` or later, don't drop back below the SDK's required range).

### MCP Tool Connections

`.mcp.json` registers two connections for the AVCalc calc tools: `avcalc` (AWS-hosted, prefix `mcp__avcalc__*`) and `avcalc-local` (`http://localhost:3000/mcp`, prefix `mcp__avcalc-local__*`, for local dev iteration). If the local server isn't running, `avcalc-local` simply fails to connect and its tools won't appear — no special handling needed. If both are connected (local server running), prefer `avcalc-local__*` tools over `avcalc__*`.  If neither the local nor AWS mcp tool can be reached, a skill needing these tools should stop and notify the user of an error. Do not fall back to simply executing code in our workspace in leiu of the mcp servers.

### Operating Instructions
You should always:
    1. Generate your plan and await my review before making any code changes.
    2. If you perform any outside research for aviation related topics, always provide me the link when reporting your findings.
    3. Do not ask persmission before commands that merely inspect our local environment under /workspaces.
    4. Do ask permission before modifying our environment, creating, editing, or deleting any files.

### Coding Standards
Every function should have a comment header block, noting at least the intent of the function, the input parameters, and return value, if any.

