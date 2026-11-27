# QamarFlow bounded contexts (target DDD design)

Target stack: Vite + React SPA in `client/`, Express API in `server/`, SQLite via `better-sqlite3`. Schema: [DATA_SCHEMA.md](DATA_SCHEMA.md). Layers and folders: [ARCHITECTURE.md](ARCHITECTURE.md).

## Context map

| Context | Subdomain type | Owns tables | Upstream of | Downstream of |
| --- | --- | --- | --- | --- |
| Identity & Access | Supporting | users, oauth_accounts, refresh_tokens | every context (Customer/Supplier via `CurrentUser`) | — |
| Workspace (Boards) | **Core** | boards, board_members, columns | Cards, Collaboration | Identity, Media |
| Cards | **Core** | cards | — | Workspace, Identity |
| Collaboration (Invites) | Supporting | invitations | Workspace (adds member via app service) | Identity, Workspace, Notifications |
| Notifications (Mail) | Generic | mail_outbox | — | Collaboration, Identity (ACL around SendGrid) |
| Media (Unsplash) | Generic | none | Workspace (background URL) | — (ACL around Unsplash, picsum) |

Shared kernel is limited to `server/src/shared/` (Id, Result, DomainError, Clock, EventBus) and `client/src/shared/`. No context imports another context's domain or repository: they talk through application services or domain events.

## 1. Identity & Access

- **Aggregate:** `User` (root). Entities: `OAuthAccount`, `RefreshToken`.
- **Value objects:** `UserId`, `Email` (lower-cased, validated), `PasswordHash`, `Username` (derived from email, as `retrieveUsernmeFromEmail` does today), `Role`, `AccessToken`.
- **Domain services:** `PasswordHasher` (bcrypt), `TokenIssuer` (jsonwebtoken, access 15 min + rotating refresh 7 d), `OAuthLinker` (find or create user on Google/Discord callback, replaces next-auth `signIn` callback).
- **Invariants:** email unique; an account has a password or at least one OAuth link.
- **Events:** `UserRegistered`, `UserSignedIn`.
- **API:** `POST /api/auth/register`, `/login`, `/refresh`, `/logout`, `GET /api/auth/oauth/:provider[/callback]`, `GET /api/users/:id`, `GET /api/users?email=` (replaces `verify-email`).

## 2. Workspace (Boards) — core

- **Aggregate:** `Board` (root). Entities: `Column`, `Membership`.
- **Value objects:** `BoardId`, `BoardName` (1..200), `BackgroundImage` (URL), `Sequence`, `MemberRole`.
- **Domain services:** `BoardAccessPolicy` (`canView`, `canEdit`, `canDelete`: owner or member; delete is owner only — fixes "no authorization" finding), `SequencePolicy` (renumber columns 0..N-1 on move; one transaction, replaces N PATCH calls from `app/components/board/columns/index.tsx`).
- **Invariants:** owner is always a member; column sequences are contiguous per board; deleting a board deletes columns and cards (FK cascade).
- **Events:** `BoardCreated`, `BoardDeleted`, `MemberAdded`, `ColumnDeleted`.
- **API:** `GET/POST /api/boards`, `GET/PATCH/DELETE /api/boards/:boardId`, `GET/POST /api/boards/:boardId/columns`, `PATCH/DELETE /api/boards/:boardId/columns/:columnId`, `PUT /api/boards/:boardId/columns/order`.

## 3. Cards — core

- **Aggregate:** `Card` (root, references `BoardId`/`ColumnId` by id only).
- **Value objects:** `CardId`, `CardTitle`, `RichTextDescription` (sanitised HTML from Quill), `Label {type, bg}`, `Assignee` (UserId that must be a board member), `Sequence`.
- **Domain services:** `CardPlacementService` (move card within/between columns, renumber both columns in one transaction), `AssignmentPolicy` (assignee must be a board member; asks Workspace via `BoardMembershipQuery` port).
- **Invariants:** card's board equals its column's board (DB trigger + domain check); sequences contiguous per column.
- **Events:** `CardCreated`, `CardMoved`, `CardAssigned`.
- **API:** `GET /api/boards/:boardId/cards`, `POST /api/boards/:boardId/columns/:columnId/cards`, `PATCH/DELETE /api/boards/:boardId/cards/:cardId`, `PUT /api/boards/:boardId/cards/order`.

## 4. Collaboration (Invites)

- **Aggregate:** `Invitation` (root).
- **Value objects:** `InvitationToken` (random 32 bytes; only the SHA-256 hash stored), `InvitationStatus` (pending, accepted, revoked, expired), `Expiry` (default 7 days), `Email`.
- **Domain services:** `InvitationService.invite(boardId, inviterId, email)` (inviter must be able to edit the board; one pending invite per board+email), `InvitationService.accept(token, currentUser)` (token valid, unexpired, email matches current user, then calls Workspace `AddMember`).
- **Events:** `InvitationCreated` (Notifications listens and sends mail), `InvitationAccepted`.
- **API:** `POST /api/boards/:boardId/invitations` (replaces `mail`), `GET /api/invitations/:token` (replaces `verify-token`), `POST /api/invitations/:token/accept` (replaces `invite-user`).

## 5. Notifications (Mail)

- **Aggregate:** `OutboundMail` (root, row in `mail_outbox`).
- **Value objects:** `MailKind`, `Recipient`, `MailTemplate` (invitation HTML moved out of the route).
- **Domain services:** `MailRateLimiter` (for example 20 per user per hour from `mail_outbox`), `Mailer` port with `SendGridMailer` adapter (sender from `MAIL_FROM` env instead of the hard-coded address).
- **Inbound:** domain events only. No public HTTP endpoint (closes the open relay).

## 6. Media (Unsplash)

- **No aggregate** (stateless generic subdomain).
- **Value objects:** `ImageRef {url, thumbUrl, author, authorLink}`, `SearchQuery`.
- **Domain services:** `ImageSearch` port with `UnsplashImageSearch` adapter (server side, so `UNSPLASH_ACCESS_KEY` is no longer shipped to the browser as `NEXT_PUBLIC_UNSPLASH_API`), `RandomImageProvider` (picsum, from `getRandomImageUrl` in `util/index.ts`).
- **API:** `GET /api/media/backgrounds?query=&page=`, `GET /api/media/backgrounds/random`.

## File mapping: every existing file to its target

Paths: `S` = `server/src`, `C` = `client/src`. "delete" means no successor (framework glue replaced by the new stack).

### API routes

| Existing file | Domain | Target |
| --- | --- | --- |
| `app/api/auth/[...nextauth]/route.ts` | Identity | `S/domains/identity/presentation/auth.routes.ts`, `application/{login,register,oauth-callback,refresh}.ts`, `infrastructure/oauth/{google,discord}.provider.ts` |
| `app/api/users/[slug]/route.ts` | Identity | `S/domains/identity/presentation/users.routes.ts` + `application/get-user.ts` |
| `app/api/verify-email/route.ts` | Identity | `S/domains/identity/application/find-user-by-email.ts` (`GET /api/users?email=`) |
| `app/api/boards/route.ts` | Workspace | `S/domains/workspace/presentation/boards.routes.ts` + `application/{list-boards,create-board}.ts` |
| `app/api/boards/[slug]/route.ts` | Workspace | same router + `application/{get-board,rename-board,delete-board}.ts` |
| `app/api/boards/[slug]/columns/route.ts` | Workspace | `S/domains/workspace/presentation/columns.routes.ts` + `application/{list-columns,add-column}.ts` |
| `app/api/boards/[slug]/columns/[cid]/route.ts` | Workspace | same router + `application/{update-column,delete-column,reorder-columns}.ts` |
| `app/api/boards/[slug]/cards/route.ts` | Cards | `S/domains/cards/presentation/cards.routes.ts` + `application/list-cards.ts` (buggy bulk DELETE dropped) |
| `app/api/boards/[slug]/cards/[cardid]/route.ts` | Cards | same router + `application/{update-card,delete-card}.ts` |
| `app/api/boards/[slug]/columns/[cid]/cards/route.ts` | Cards | same router + `application/create-card.ts` (wrong-target DELETE dropped) |
| `app/api/boards/[slug]/columns/[cid]/cards/[cardid]/route.ts` | Cards | `application/move-card.ts` (boardName/columnName denormalisation dropped) |
| `app/api/mail/route.ts` | Collaboration + Notifications | `S/domains/collaboration/application/create-invitation.ts`; email part to `S/domains/notifications/{application/send-invitation-mail.ts,infrastructure/sendgrid.mailer.ts,domain/templates/invitation.html.ts}` |
| `app/api/invite-user/route.ts` | Collaboration | `S/domains/collaboration/application/accept-invitation.ts` |
| `app/api/verify-token/route.ts` | Collaboration | `S/domains/collaboration/application/verify-invitation.ts` |

### Shared types, utilities, state

| Existing file | Domain | Target |
| --- | --- | --- |
| `types/boards.ts` | Workspace | `S/domains/workspace/domain/{board,column}.ts`; DTOs `C/features/boards/model/types.ts` |
| `types/columns.ts` | Workspace | `C/features/columns/model/types.ts` |
| `types/cards.ts` | Cards | `S/domains/cards/domain/{card,label}.ts`; DTOs `C/features/cards/model/types.ts` |
| `types/user.ts` | Identity | `S/domains/identity/domain/user.ts`; `C/features/auth/model/types.ts` |
| `util/mongodb.js` | Infrastructure | replaced by `S/infrastructure/db/{connection.ts,schema.sql}` |
| `util/check-environment.ts` | Shared | `S/config/env.ts` + `C/shared/config/env.ts` (`import.meta.env.VITE_API_URL`) |
| `util/index.ts` | Media | `S/domains/media/infrastructure/picsum.provider.ts` |
| `util/is-valid-user.ts` | Identity | `S/domains/identity/presentation/require-auth.middleware.ts` |
| `util/verify-email.ts` | Identity | `C/features/auth/api/auth.api.ts` |
| `util/verify-token.ts` | Collaboration | `C/features/invitations/api/invitations.api.ts` |
| `util/invite-user.ts` | Collaboration | `C/features/invitations/api/invitations.api.ts` |
| `util/initialise-store.ts` | Client app | `C/app/store.ts` |
| `slices/store.ts` | Client app | `C/app/store.ts` |
| `slices/user.ts` | Identity | `C/features/auth/model/auth.slice.ts` |
| `slices/users.ts` | Identity | `C/features/members/model/members.slice.ts` |
| `slices/boards.ts` | Workspace | `C/features/boards/model/boards.slice.ts` |
| `slices/board.ts` | Workspace | `C/features/boards/model/board.slice.ts` |
| `slices/columns.ts` | Workspace | `C/features/columns/model/columns.slice.ts` (fix duplicate `card/updateCardSequence` type) |
| `slices/cards.ts` | Cards | `C/features/cards/model/cards.slice.ts` |
| `hooks/index.ts` | Client app | `C/app/hooks.ts` |
| `hooks/withAuth.ts` | Identity | `C/features/auth/ui/RequireAuth.tsx` |
| `lib/auth.d.ts` | — | delete (Next generated type check) |
| `next-env.d.ts` | — | delete; `client/src/vite-env.d.ts` |

### Pages and layouts

| Existing file | Domain | Target |
| --- | --- | --- |
| `app/layout.tsx` | Client app | `client/index.html` + `C/app/App.tsx` |
| `app/template.tsx` | Client app | `C/app/App.tsx` |
| `app/page.tsx` | Identity | `C/pages/LandingPage.tsx` |
| `app/home/page.tsx` | Workspace | `C/pages/HomePage.tsx` |
| `app/boards/page.tsx` | Workspace | `C/pages/BoardsPage.tsx` |
| `app/boards/[slug]/page.tsx` | Workspace | `C/pages/BoardPage.tsx` (route `/boards/:boardId`) |
| `app/settings/page.tsx` | Identity | `C/pages/SettingsPage.tsx` |
| `app/templates/page.tsx` | Workspace | `C/pages/TemplatesPage.tsx` |
| `app/error.tsx`, `app/error/page.tsx` | Client app | `C/app/ErrorBoundary.tsx`, `C/pages/ErrorPage.tsx` |
| `app/components/layout/ChakraProviderWrapper.tsx` | Client app | `C/app/providers/ChakraProvider.tsx` |
| `app/components/layout/ReduxProviderWrapper.tsx` | Client app | `C/app/providers/StoreProvider.tsx` |
| `app/components/layout/SessionProviderWrapper.tsx` | Identity | `C/features/auth/ui/AuthProvider.tsx` |
| `app/components/layout/WithAuthWrapper.tsx` | Identity | `C/features/auth/ui/RequireAuth.tsx` |
| `app/components/layout/BoardLayoutWrapper.tsx` | Workspace | `C/widgets/board-layout/BoardLayout.tsx` |
| `app/components/layout/BoardsLayoutWrapper.tsx` | Workspace | `C/widgets/boards-layout/BoardsLayout.tsx` |
| `app/components/layout/SidebarWrapper.tsx` | Client app | `C/widgets/sidebar/Sidebar.tsx` |
| `app/components/layout/Header.tsx` | Client app | `C/widgets/header/Header.tsx` |
| `app/components/layout/QamarFlowLink.tsx` | Client app | `C/shared/ui/BrandLink.tsx` |
| `app/components/hoc/with-auth.tsx` | Identity | `C/features/auth/ui/RequireAuth.tsx` |
| `app/components/hoc/with-store.tsx` | Client app | `C/app/providers/StoreProvider.tsx` |
| `app/components/hoc/with-board-layout.tsx` | Workspace | `C/widgets/board-layout/BoardLayout.tsx` |
| `app/components/hoc/with-boards-layout.tsx` | Workspace | `C/widgets/boards-layout/BoardsLayout.tsx` |
| `app/components/hoc/with-sidebar.tsx` | Client app | `C/widgets/sidebar/Sidebar.tsx` |
| `app/components/hoc/with-register-layout.tsx` | Collaboration | `C/pages/AcceptInvitationPage.tsx` (route `/invite/:token`; the missing `/signup` page) |

### Feature components

| Existing file | Domain | Target |
| --- | --- | --- |
| `app/components/home/index.tsx` | Workspace | `C/pages/HomePage.tsx` |
| `app/components/welcome-screen/index.tsx` | Identity | `C/features/auth/ui/WelcomeScreen.tsx` |
| `app/components/login/index.tsx` | Identity | `C/features/auth/ui/LoginForm.tsx` |
| `app/components/login/modal.tsx` | Identity | `C/features/auth/ui/LoginModal.tsx` |
| `app/components/navbar/index.tsx` | Client app | `C/widgets/navbar/Navbar.tsx` |
| `app/components/user-navbar/index.tsx` | Identity | `C/widgets/navbar/UserMenu.tsx` |
| `app/components/settings/index.tsx` | Identity | `C/features/auth/ui/AccountSettings.tsx` |
| `app/components/templates/index.tsx` | Workspace | `C/features/boards/ui/Templates.tsx` |
| `app/components/boards/index.tsx` | Workspace | `C/features/boards/ui/BoardList.tsx` |
| `app/components/board/index.tsx` | Workspace | `C/features/boards/ui/BoardView.tsx` |
| `app/components/board/columns/index.tsx` | Workspace + Cards | `C/features/columns/ui/ColumnsBoard.tsx` (drag/drop calls `PUT .../order`; renumbering moves to server) |
| `app/components/board/columns/column.tsx` | Workspace | `C/features/columns/ui/Column.tsx` |
| `app/components/board/columns/buttons/add-column-button.tsx` | Workspace | `C/features/columns/ui/AddColumnButton.tsx` |
| `app/components/board/columns/cards.tsx` | Cards | `C/features/cards/ui/CardList.tsx` |
| `app/components/board/columns/card.tsx` | Cards | `C/features/cards/ui/CardItem.tsx` |
| `app/components/board/columns/modals/card-details-modal.tsx` | Cards | `C/features/cards/ui/CardDetailsModal.tsx` |
| `app/components/board/columns/modals/card-labels-menu.tsx` | Cards | `C/features/cards/ui/CardLabelsMenu.tsx` |
| `app/components/quill-editor/index.tsx` | Shared UI | `C/shared/ui/RichTextEditor.tsx` |
| `app/components/sub-navbar/index.tsx` | Workspace | `C/widgets/board-toolbar/BoardToolbar.tsx` |
| `app/components/sub-navbar/board-settings/index.tsx` | Workspace | `C/features/boards/ui/BoardSettingsMenu.tsx` |
| `app/components/sub-navbar/invite-user/modal.tsx` | Collaboration | `C/features/invitations/ui/InviteMemberModal.tsx` |
| `app/components/sub-navbar/unsplash-in-drawer/index.tsx` | Media | `C/features/backgrounds/ui/BackgroundDrawer.tsx` |
| `app/components/sub-navbar/unsplash-in-drawer/unsplash.tsx` | Media | `C/features/backgrounds/ui/UnsplashPicker.tsx` + `C/features/backgrounds/api/backgrounds.api.ts` (calls server, no key in browser) |

### Config and tooling

| Existing file | Target |
| --- | --- |
| `package.json`, `package-lock.json`, `yarn.lock` | root workspace `package.json` + `client/package.json` + `server/package.json`; keep one lockfile (pick npm or yarn) |
| `tsconfig.json` | `tsconfig.base.json` + `client/tsconfig.json` + `server/tsconfig.json` |
| `.env.example` | `server/.env.example` (JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_PATH, SENDGRID_API_KEY, MAIL_FROM, UNSPLASH_ACCESS_KEY, GOOGLE_*, DISCORD_*, CLIENT_URL) + `client/.env.example` (VITE_API_URL) |
| `styles/default.css` | `client/src/app/styles/default.css` |
| `Dockerfile`, `docker-compose.yml`, `.dockerignore` | multi-stage: build client, serve `client/dist` from Express; SQLite file on a volume |
| `.github/workflows/main.yml`, `.github/workflows/codeql-analysis.yml`, `codeql-analysis.yml` | keep; CI runs `npm run lint && npm test` per workspace (root `codeql-analysis.yml` is a duplicate, delete) |
| `.husky/pre-commit`, `.husky/.gitignore`, `.prettierrc`, `.prettierignore`, `.editorconfig` | keep at root |
| `.github/ISSUE_TEMPLATE/bug_report.md`, `README.md`, `LICENSE`, `demo.gif`, `.gitignore` | keep (add `*.sqlite` to `.gitignore`) |
| `public/**` | `client/public/**` |
