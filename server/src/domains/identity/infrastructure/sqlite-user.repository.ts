import type { Db } from '../../../infrastructure/db/connection.js';
import type { RefreshToken, User } from '../domain/user.js';
import type { RefreshTokenRepository, UserRepository } from '../application/ports.js';

const USER_COLS = `id, email, username, full_name AS fullName, avatar_url AS avatarUrl, password_hash AS passwordHash,
  role, company, created_at AS createdAt`;

export class SqliteUserRepository implements UserRepository {
  constructor(private db: Db) {}
  findById(id: string) {
    return this.db.prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).get(id) as User | undefined;
  }
  findByEmail(email: string) {
    return this.db.prepare(`SELECT ${USER_COLS} FROM users WHERE email = ?`).get(email) as User | undefined;
  }
  insert(u: User) {
    this.db.prepare(`INSERT INTO users (id, email, username, full_name, avatar_url, password_hash, role, company, created_at, updated_at)
      VALUES (@id, @email, @username, @fullName, @avatarUrl, @passwordHash, @role, @company, @createdAt, @createdAt)`).run(u);
  }
}

export class SqliteRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private db: Db) {}
  insert(t: RefreshToken) {
    this.db.prepare(`INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked_at)
      VALUES (@id, @userId, @tokenHash, @expiresAt, @revokedAt)`).run(t);
  }
  findByHash(hash: string) {
    return this.db.prepare(`SELECT id, user_id AS userId, token_hash AS tokenHash, expires_at AS expiresAt,
      revoked_at AS revokedAt FROM refresh_tokens WHERE token_hash = ?`).get(hash) as RefreshToken | undefined;
  }
  revoke(id: string, at: string) {
    this.db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE id = ?`).run(at, id);
  }
  revokeAllForUser(userId: string, at: string) {
    this.db.prepare(`UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL`).run(at, userId);
  }
}
