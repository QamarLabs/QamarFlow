# QamarFlow

Kanban boards (boards → columns → cards), with members, invites, and Unsplash backgrounds.

**Stack:** React 18 + Vite + Chakra UI + Redux Toolkit (`client/`) · Express + TypeScript + SQLite/better-sqlite3 (`server/`). Organized by Domain-Driven Design bounded contexts: Identity, Boards, Cards, Invites, Mail, Media.

```
npm run install:all && npm run seed
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```
Demo login: `demo@qamarflow.local` / `password123`.

Docs: [Architecture](docs/ARCHITECTURE.md) · [Domains](docs/DOMAINS.md) · [Data schema](docs/DATA_SCHEMA.md) · [API](server/API.md) · [Handoff](HANDOFF.md)
