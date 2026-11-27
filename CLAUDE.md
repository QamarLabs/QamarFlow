# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

QamarFlow is a kanban board app. It is two npm projects with no workspaces: `server/` (Express + SQLite via better-sqlite3, JWT auth) and `client/` (Vite 6 + React SPA, Chakra UI, Redux Toolkit, @hello-pangea/dnd). It replaced a Next.js + MongoDB app. Read `DECISIONS.md` before changing the stack, auth or tooling.

## Commands (run from the repo root)
```
npm run install:all     # installs server/ and client/ separately; the root only has husky, lint-staged and prettier
npm run seed            # demo user: demo@qamarflow.local / password123
npm run dev:server      # http://localhost:4000 (tsx watch)
npm run dev:client      # http://localhost:5173, proxies /api to :4000
npm run typecheck       # both projects
npm test                # server vitest (9 tests), then client vitest (14 tests)
npm run build           # server tsc (copies schema.sql into dist), client tsc + vite build
npm run smoke           # scripts/smoke.mjs: 19 end-to-end API/SPA checks; BASE_URL defaults to the Docker app on :8080
docker compose up -d --build   # client (nginx) on :8080; needs JWT_SECRET and JWT_REFRESH_SECRET in a gitignored root .env
```
Run a single test: `npm --prefix server test -- test/cards.test.ts`, `npm --prefix client test -- src/pages/LoginPage.test.tsx`, or add `-t "<name>"`.

Pre-commit runs husky v9 + lint-staged, which applies prettier to staged files only.

## Architecture
- **Server domains** live in `server/src/domains/<domain>/`: identity, boards, cards, invites, mail, media. Each domain has the layers `domain/` (pure TypeScript, with no Express, SQLite or SDK imports), `application/` (use cases plus the ports they depend on), `infrastructure/` (Sqlite repositories, SendGrid, Unsplash, JWT/bcrypt adapters that implement the ports) and `presentation/` (Express routers, zod validation). Domains must not import from each other. Shared code is in `server/src/shared` and `server/src/infrastructure/db`. Wiring happens in `server/src/app.ts`.
- **Database:** `server/src/infrastructure/db/schema.sql` is the single source of truth for the schema, and it is applied on startup to `server/data/qamarflow.db` (gitignored). There are no migrations and no Mongo import; the database starts empty, and `npm run seed` adds demo data. The ER diagram is in `docs/DATA_SCHEMA.md`.
- **Client** uses feature slices: `client/src/{app,pages,widgets,features,shared}`. Each `features/<x>/` has `api/`, `model/` and `ui/` folders plus an `index.ts`; import a feature through its `index.ts`. All HTTP calls go through `shared/api/http.ts`, which sends a Bearer access token and refreshes it with an httpOnly refresh cookie. The `@` import alias maps to `client/src`.
- **Docs:** `docs/DOMAINS.md` (domain map), `docs/ARCHITECTURE.md` (diagrams), `server/API.md` (API contract).

## Constraints from past sessions
- Auth is email + password only. Do not add Google or Discord sign-in (a user correction). `docs/ARCHITECTURE.md` still shows OAuth; ignore that part of the diagram.
- Docker and CI must use Node 22, because better-sqlite3 13 segfaults on Node 20.
- In `client/nginx.conf`, keep `try_files $uri /index.html` and `absolute_redirect off`. The `public/` folder has `login/` and `boards/` folders whose names match SPA routes, and without these settings nginx redirects those routes to port 80.
- Vite manual chunks (quill, ui, dnd, react-vendor) keep every chunk under the size warning (the largest is about 300 kB). Keep it that way.
- CI (`.github/workflows/main.yml`, CodeQL v3) runs on the `development` branch, which is also the PR base.
- Multi-session work uses `HANDOFF.md`, `DECISIONS.md` (keep it under 20 entries) and `check_state.md`.
