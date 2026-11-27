import type { Db } from '../../../infrastructure/db/connection.js';
import type { Invitation } from '../domain/invitation.js';
import type { InvitationRepository } from '../application/ports.js';

const COLS = `id, token_hash AS tokenHash, board_id AS boardId, inviter_id AS inviterId, email, status,
  expires_at AS expiresAt, accepted_by AS acceptedBy, accepted_at AS acceptedAt, created_at AS createdAt`;

export class SqliteInvitationRepository implements InvitationRepository {
  constructor(private db: Db) {}
  insert(i: Invitation) {
    this.db.prepare(`INSERT INTO invitations (id, token_hash, board_id, inviter_id, email, status, expires_at, created_at)
      VALUES (@id, @tokenHash, @boardId, @inviterId, @email, @status, @expiresAt, @createdAt)`).run(i);
  }
  findByTokenHash(hash: string) {
    return this.db.prepare(`SELECT ${COLS} FROM invitations WHERE token_hash = ?`).get(hash) as Invitation | undefined;
  }
  findPending(boardId: string, email: string) {
    return this.db.prepare(`SELECT ${COLS} FROM invitations WHERE board_id = ? AND email = ? AND status = 'pending'`)
      .get(boardId, email) as Invitation | undefined;
  }
  markExpired(id: string) { this.db.prepare(`UPDATE invitations SET status = 'expired' WHERE id = ?`).run(id); }
  markAccepted(id: string, userId: string, at: string) {
    this.db.prepare(`UPDATE invitations SET status = 'accepted', accepted_by = ?, accepted_at = ? WHERE id = ?`)
      .run(userId, at, id);
  }
}
