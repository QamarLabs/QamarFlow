# QamarFlow API contract

Base URL: `http://localhost:4000` (env `PORT`). All bodies are JSON, all fields camelCase, timestamps ISO-8601 strings.

## Conventions

- **Auth:** send `Authorization: Bearer <accessToken>` on every endpoint marked (auth). Access tokens live 15 minutes.
- **Refresh:** the refresh token is an httpOnly cookie `qf_refresh` (path `/api/auth`, SameSite=Lax). Clients must use `credentials: 'include'` on `/api/auth/*` calls. CORS allows `CLIENT_URL` (default `http://localhost:5173`) with credentials.
- **Errors:** every non-2xx response is `{ "error": { "code": string, "message": string, "details"?: unknown } }`.
  Codes: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429), `INTERNAL` (500), `UPSTREAM_ERROR` (502).
- **Authorization:** board, column, card and invitation endpoints require that the caller is a member of the board (owner or member). A non-member gets `404 NOT_FOUND` (board existence is not leaked). Deleting a board is owner-only (`403 FORBIDDEN` for members).

## Shared shapes

```ts
type User = { id: string; email: string; username: string; fullName: string; avatarUrl: string | null; role: string; company: string | null; createdAt: string };
type PublicUser = { id: string; username: string; fullName: string; avatarUrl: string | null; email: string };
type AuthResponse = { accessToken: string; user: User };

type Member = { userId: string; username: string; fullName: string; email: string; avatarUrl: string | null; role: 'owner' | 'member'; joinedAt: string };
type Board = { id: string; name: string; ownerId: string; backgroundImage: string | null; createdAt: string; updatedAt: string; role: 'owner' | 'member' };
type BoardDetail = Board & { members: Member[]; columns: Column[] };
type Column = { id: string; boardId: string; name: string; sequence: number; createdBy: string | null; createdAt: string; updatedAt: string };

type Label = { type: string; bg: string };
type Card = { id: string; boardId: string; columnId: string; title: string; description: string /* sanitised HTML */; type: string; sequence: number; assigneeId: string | null; label: Label | null; createdBy: string | null; createdAt: string; updatedAt: string };

type InvitationInfo = { boardId: string; boardName: string; email: string; inviterName: string; status: 'pending' | 'accepted' | 'revoked' | 'expired'; expiresAt: string };
type ImageRef = { id: string; url: string; thumbUrl: string; author: string; authorLink: string };
```

## Health

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/health` | - | `200 { ok: true }` |

## Identity

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | `{ email, password (8..128), fullName? }` | `201 AuthResponse` + sets refresh cookie. `409 CONFLICT` if email taken |
| POST | `/api/auth/login` | `{ email, password }` | `200 AuthResponse` + sets refresh cookie. `401` on bad credentials |
| POST | `/api/auth/refresh` | - (cookie) | `200 AuthResponse`, rotates refresh cookie. `401` if cookie missing/invalid/revoked |
| POST | `/api/auth/logout` | - (cookie) | `204`, revokes token, clears cookie |
| GET | `/api/auth/me` (auth) | - | `200 { user: User }` |
| GET | `/api/users/:id` (auth) | - | `200 { user: PublicUser }` |
| GET | `/api/users?email=` (auth) | - | `200 { user: PublicUser \| null }` |

Auth endpoints are rate limited (`429`).

## Boards (auth)

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/boards` | - | `200 { boards: Board[] }` (boards the caller is a member of, newest first) |
| POST | `/api/boards` | `{ name (1..200), backgroundImage?: string(url) \| null }` | `201 { board: Board }` (caller becomes owner) |
| GET | `/api/boards/:boardId` | - | `200 { board: BoardDetail }` |
| PATCH | `/api/boards/:boardId` | `{ name?, backgroundImage?: string \| null }` | `200 { board: Board }` |
| DELETE | `/api/boards/:boardId` | - | `204` (owner only; cascades columns, cards, invitations) |

## Columns (auth)

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/boards/:boardId/columns` | - | `200 { columns: Column[] }` ordered by sequence |
| POST | `/api/boards/:boardId/columns` | `{ name (1..200) }` | `201 { column: Column }` (appended at end) |
| PATCH | `/api/boards/:boardId/columns/:columnId` | `{ name }` | `200 { column: Column }` |
| DELETE | `/api/boards/:boardId/columns/:columnId` | - | `204` (deletes its cards, renumbers remaining columns) |
| PUT | `/api/boards/:boardId/columns/order` | `{ columnIds: string[] }` (must be exactly the board's column ids, in new order) | `200 { columns: Column[] }` |

## Cards (auth)

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| GET | `/api/boards/:boardId/cards` | - | `200 { cards: Card[] }` ordered by columnId, sequence |
| POST | `/api/boards/:boardId/columns/:columnId/cards` | `{ title?, description?, type?, assigneeId?: string \| null, label?: Label \| null }` | `201 { card: Card }` (appended at end of column) |
| PATCH | `/api/boards/:boardId/cards/:cardId` | `{ title?, description?, type?, assigneeId?: string \| null, label?: Label \| null }` | `200 { card: Card }` |
| DELETE | `/api/boards/:boardId/cards/:cardId` | - | `204` (renumbers its column) |
| PUT | `/api/boards/:boardId/cards/order` | `{ cardId, toColumnId, toIndex (>=0, clamped) }` | `200 { cards: Card[] }` (all cards of the board after the move; one transaction) |

`description` is sanitised server side (Quill-safe tags only). `assigneeId` must be a board member (`400 VALIDATION_ERROR` otherwise).

## Invitations

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| POST | `/api/boards/:boardId/invitations` (auth) | `{ email }` | `201 { invitation: { id, email, status, expiresAt } }`. Sends mail with link `CLIENT_URL/invite/:token`. `409` if a pending invite exists or user already a member. `429` past 20 mails/hour/user |
| GET | `/api/invitations/:token` | - | `200 { invitation: InvitationInfo }`, `404` if unknown |
| POST | `/api/invitations/:token/accept` (auth) | - | `200 { boardId }`. `403` if caller email differs from invite email, `409` if not pending / expired |

In development (no `SENDGRID_API_KEY`) the mail, including the invite link, is printed to the server console.

## Media (auth)

| Method | Path | Query | Response |
| --- | --- | --- | --- |
| GET | `/api/media/backgrounds` | `query` (default `"nature"`), `page` (default 1) | `200 { images: ImageRef[] }`. Without `UNSPLASH_ACCESS_KEY` it returns picsum images |
| GET | `/api/media/backgrounds/random` | - | `200 { image: ImageRef }` |
