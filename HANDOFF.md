# HANDOFF — QamarFlow DDD refactor

**Session budget rule:** 250K soft limit per session (orchestrator and each subagent). At ~200K, update this file and start a new session.
**To resume:** in a new session run `/ddd-implement-loop` and say "continue from HANDOFF.md". Read `check_state.md` and `DECISIONS.md` first.

## Status (2026-11-27)
| Step | Status |
|---|---|
| 1 Grilling | cancelled (the prompt said exactly what to do) |
| 2 DDD evaluation | done: docs/DOMAINS.md, DATA_SCHEMA.md, ARCHITECTURE.md |
| 3 Implementation | done: server/ (Express+SQLite), client/ (Vite+React); Next.js removed |
| 4 DDD re-evaluation | done: no cross-domain imports in server/ or client/; domain layer has no framework imports |
| 5 Verification | done: typecheck ✔, 9/9 server tests ✔, client build ✔, smoke test through the Vite proxy ✔ |

## Run it
```
npm run install:all
npm run seed            # demo@qamarflow.local / password123
npm run dev:server      # :4000
npm run dev:client      # :5173 (proxies /api)
```

## Where things live
- Schema (source of truth): `server/src/infrastructure/db/schema.sql`; relationships and ER diagram in `docs/DATA_SCHEMA.md`
- Design diagrams: `docs/ARCHITECTURE.md`; domain map: `docs/DOMAINS.md`; API contract: `server/API.md`
- SQLite file: `server/data/qamarflow.db` (gitignored, created on startup)

## Round 2 (2026-11-27): done
- Docker: `server/Dockerfile`, `client/Dockerfile` + `nginx.conf`, `docker-compose.yml` (client on :8080). Requires `JWT_SECRET` and `JWT_REFRESH_SECRET`. `docker compose config` passes; the images have NOT been built (the Docker Desktop engine wasn't running).
- CI: `main.yml` + CodeQL v3, triggered on `development`.
- Code-split: largest chunk 302 kB, no warning.
- Client tests: vitest 3 + Testing Library, 14 tests. Root `npm test` runs the server (9) and client (14) tests.

## Round 3 (2026-11-27): done
- Docker verified: `docker compose up -d --build` runs on http://localhost:8080. Secrets come from a gitignored root `.env` (`JWT_SECRET`, `JWT_REFRESH_SECRET`).
- Fixed: the server container segfaulted (exit 139) because better-sqlite3 13 doesn't work on Node 20, so Docker and CI are now on **Node 22**. Fixed: nginx redirected `/login` and `/boards` to port 80 because `public/` has folders with the same names; `try_files $uri /index.html` and `absolute_redirect off` fix it.
- QA: `npm run smoke` (`scripts/smoke.mjs`, `BASE_URL` overridable) runs 19 checks through nginx: SPA routes, register/login/refresh, board, columns, card create/edit/move, column reorder, sanitizing, invite, media, non-member blocked. All pass.
- NOT done: clicking through the real UI. The Chrome extension wasn't connected.

## Round 4 (2026-11-27): done
- Client on Vite 6.4 + vitest 5 (same major as the server). Largest chunk 302 kB, no warning.
- Pre-commit: husky v9 + lint-staged (prettier on staged files only); no more git add .
- Verified: typecheck, tests (server 9, client 14), build, docker compose, smoke 19/19.
- Note: lint-staged was run over the staged (uncommitted) tree once, so new files may be prettier-formatted. Formatting only; all checks pass afterwards.

## Next steps
1. Visual UI pass in a browser (skipped by the user in round 4). Do it by hand, or connect the Claude in Chrome extension.
2. Commit the work on a feature branch and open a PR to development.
