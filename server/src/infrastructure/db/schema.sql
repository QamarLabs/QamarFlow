-- QamarFlow SQLite schema (better-sqlite3)
-- Derived from the Mongo collections used in app/api/** and types/:
--   users, boards (+ embedded users[] array), columns, cards, token
-- Run once at boot: db.exec(fs.readFileSync('schema.sql','utf8'))
-- Ids stay TEXT so existing shortid / provider ids migrate unchanged.

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ---------------------------------------------------------------------------
-- Identity context
-- Mongo `users`: _id (providerAccountId), username, email, fullName, avatar,
-- emailVerified, role, company. Adds password_hash for local JWT auth.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE COLLATE NOCASE,
  username        TEXT NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  avatar_url      TEXT,
  password_hash   TEXT,                          -- NULL for OAuth-only accounts
  email_verified  INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0,1)),
  role            TEXT NOT NULL DEFAULT 'Employee',
  company         TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Linked OAuth identities (Google / Discord), replaces next-auth providers.
CREATE TABLE IF NOT EXISTS oauth_accounts (
  provider             TEXT NOT NULL CHECK (provider IN ('google','discord')),
  provider_account_id  TEXT NOT NULL,
  user_id              TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at           TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user ON oauth_accounts(user_id);

-- Refresh tokens for JWT rotation (hash only, never the raw token).
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TEXT NOT NULL,
  revoked_at  TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- ---------------------------------------------------------------------------
-- Workspace context: Board aggregate
-- Mongo `boards`: _id, name, createdBy, dateCreated, backgroundImage, users[]
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS boards (
  id                TEXT PRIMARY KEY,
  name              TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 200),
  owner_id          TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- was createdBy
  background_image  TEXT,                                                  -- Unsplash/picsum URL
  created_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')), -- was dateCreated
  updated_at        TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_boards_owner ON boards(owner_id);

-- Replaces the embedded boards.users[] array (invited members).
CREATE TABLE IF NOT EXISTS board_members (
  board_id   TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  joined_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (board_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_board_members_user ON board_members(user_id);

-- Mongo `columns`: _id, boardId, columnName, sequence, userId, dateCreated
-- (boardName denormalisation dropped; join to boards instead).
CREATE TABLE IF NOT EXISTS columns (
  id          TEXT PRIMARY KEY,
  board_id    TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                                     -- was columnName
  sequence    INTEGER NOT NULL CHECK (sequence >= 0),
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,      -- was userId
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
-- Not UNIQUE(board_id, sequence): reorders renumber inside one transaction,
-- and a unique index would fail mid-update. Enforce in the domain service.
CREATE INDEX IF NOT EXISTS idx_columns_board_seq ON columns(board_id, sequence);

-- ---------------------------------------------------------------------------
-- Cards context
-- Mongo `cards`: _id, boardId, columnId, title, type, description, sequence,
-- assignedTo (single user id string), label {bg,type}, userId, dateCreated
-- (boardName/columnName denormalisation dropped).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cards (
  id           TEXT PRIMARY KEY,
  board_id     TEXT NOT NULL REFERENCES boards(id)  ON DELETE CASCADE,
  column_id    TEXT NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT 'Add title',
  description  TEXT NOT NULL DEFAULT '',          -- Quill HTML; sanitise on write
  type         TEXT NOT NULL DEFAULT '',
  sequence     INTEGER NOT NULL CHECK (sequence >= 0),
  assignee_id  TEXT REFERENCES users(id) ON DELETE SET NULL,  -- was assignedTo
  label_type   TEXT,                              -- Label value object: type
  label_bg     TEXT,                              -- Label value object: bg colour
  created_by   TEXT REFERENCES users(id) ON DELETE SET NULL,  -- was userId
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK ((label_type IS NULL) = (label_bg IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_cards_board          ON cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_column_seq     ON cards(column_id, sequence);
CREATE INDEX IF NOT EXISTS idx_cards_assignee       ON cards(assignee_id);

-- Card.board_id must match its column's board.
CREATE TRIGGER IF NOT EXISTS trg_cards_board_matches_column_ins
BEFORE INSERT ON cards
WHEN (SELECT board_id FROM columns WHERE id = NEW.column_id) IS NOT NEW.board_id
BEGIN SELECT RAISE(ABORT, 'card.board_id does not match column.board_id'); END;

CREATE TRIGGER IF NOT EXISTS trg_cards_board_matches_column_upd
BEFORE UPDATE OF column_id, board_id ON cards
WHEN (SELECT board_id FROM columns WHERE id = NEW.column_id) IS NOT NEW.board_id
BEGIN SELECT RAISE(ABORT, 'card.board_id does not match column.board_id'); END;

-- ---------------------------------------------------------------------------
-- Collaboration context: Invitation aggregate
-- Mongo `token`: token, userId (inviter), status ('valid'), email, boardId
-- Adds expiry, acceptance tracking, and stores only a hash of the token.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invitations (
  id            TEXT PRIMARY KEY,
  token_hash    TEXT NOT NULL UNIQUE,
  board_id      TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  inviter_id    TEXT NOT NULL REFERENCES users(id)  ON DELETE CASCADE, -- was userId
  email         TEXT NOT NULL COLLATE NOCASE,
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','revoked','expired')),
  expires_at    TEXT NOT NULL,
  accepted_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  accepted_at   TEXT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS idx_invitations_board  ON invitations(board_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email  ON invitations(email);
-- At most one live invite per (board, email).
CREATE UNIQUE INDEX IF NOT EXISTS uq_invitations_pending
  ON invitations(board_id, email) WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- Notifications context: outbound mail log (audit + rate limiting)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mail_outbox (
  id             TEXT PRIMARY KEY,
  kind           TEXT NOT NULL CHECK (kind IN ('board_invitation','verify_email')),
  to_email       TEXT NOT NULL,
  requested_by   TEXT REFERENCES users(id) ON DELETE SET NULL,
  invitation_id  TEXT REFERENCES invitations(id) ON DELETE SET NULL,
  status         TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed')),
  provider_id    TEXT,                 -- SendGrid message id
  error          TEXT,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  sent_at        TEXT
);
CREATE INDEX IF NOT EXISTS idx_mail_outbox_requester_time ON mail_outbox(requested_by, created_at);
CREATE INDEX IF NOT EXISTS idx_mail_outbox_status         ON mail_outbox(status);
