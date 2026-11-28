# Decisions
1. Stack target: Vite + React SPA (client/) + Express API (server/), SQLite via better-sqlite3. Replaces Next.js + MongoDB.
2. Step 3 scope = fullstack Node; no prompt needed (Next API routes must be replaced).
3. Context budget: 250K soft per session; at 200K write HANDOFF.md and prompt user.
4. Step 3 builds all 6 domains (Identity, Boards, Cards, Invites, Mail, Media).
5. Auth = email+password + JWT (bcrypt) only. USER CORRECTION: do NOT add Google/Discord sign-in, and keep it out of HANDOFF.md.
6. Fresh SQLite + seed data; no Mongo migration script.
7. Client and server both on vitest 5; client on Vite 6.4.
8. Docker/CI use Node 22: better-sqlite3 13 segfaults on Node 20.
9. Round 4: user skipped the browser UI pass; chose Vite 6 only (no card_labels) and lint-staged.
10. Round 5: UI pass done by the user by hand (Chrome extension not connected); PR #1 opened.
11. Vercel hosts client/ only (root vercel.json; Vercel Root Directory must stay blank); /api is proxied by a rewrite to an external API host, because SQLite can't persist on Vercel. Actions: checkout v7, setup-node v7, CodeQL v4.
12. Vite manualChunks: never add a catch-all 'vendor' chunk. It made a static vendor<->react-vendor cycle that crashed prod (useLayoutEffect of undefined). After changing chunks, check dist for static import cycles.
