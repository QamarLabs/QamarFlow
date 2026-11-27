import type { Db } from '../../../infrastructure/db/connection.js';
import type { Board, Column, Member, MemberRole } from '../domain/board.js';
import type { BoardRepository } from '../application/ports.js';

const BOARD_COLS = `b.id, b.name, b.owner_id AS ownerId, b.background_image AS backgroundImage,
  b.created_at AS createdAt, b.updated_at AS updatedAt`;
const COLUMN_COLS = `id, board_id AS boardId, name, sequence, created_by AS createdBy,
  created_at AS createdAt, updated_at AS updatedAt`;

export class SqliteBoardRepository implements BoardRepository {
  constructor(private db: Db) {}

  listForUser(userId: string) {
    return this.db.prepare(`SELECT ${BOARD_COLS}, m.role FROM boards b
      JOIN board_members m ON m.board_id = b.id WHERE m.user_id = ? ORDER BY b.created_at DESC, b.id`)
      .all(userId) as (Board & { role: MemberRole })[];
  }
  findById(id: string) {
    return this.db.prepare(`SELECT ${BOARD_COLS} FROM boards b WHERE b.id = ?`).get(id) as Board | undefined;
  }
  roleOf(boardId: string, userId: string) {
    const row = this.db.prepare(`SELECT role FROM board_members WHERE board_id = ? AND user_id = ?`)
      .get(boardId, userId) as { role: MemberRole } | undefined;
    return row?.role;
  }
  insert(b: Board) {
    this.db.prepare(`INSERT INTO boards (id, name, owner_id, background_image, created_at, updated_at)
      VALUES (@id, @name, @ownerId, @backgroundImage, @createdAt, @updatedAt)`).run(b);
  }
  update(b: Board) {
    this.db.prepare(`UPDATE boards SET name = @name, background_image = @backgroundImage, updated_at = @updatedAt
      WHERE id = @id`).run(b);
  }
  delete(id: string) { this.db.prepare(`DELETE FROM boards WHERE id = ?`).run(id); }

  members(boardId: string) {
    return this.db.prepare(`SELECT u.id AS userId, u.username, u.full_name AS fullName, u.email,
      u.avatar_url AS avatarUrl, m.role, m.joined_at AS joinedAt
      FROM board_members m JOIN users u ON u.id = m.user_id WHERE m.board_id = ?
      ORDER BY m.role DESC, m.joined_at`).all(boardId) as Member[];
  }
  addMember(boardId: string, userId: string, role: MemberRole) {
    this.db.prepare(`INSERT OR IGNORE INTO board_members (board_id, user_id, role) VALUES (?, ?, ?)`)
      .run(boardId, userId, role);
  }

  listColumns(boardId: string) {
    return this.db.prepare(`SELECT ${COLUMN_COLS} FROM columns WHERE board_id = ? ORDER BY sequence, created_at`)
      .all(boardId) as Column[];
  }
  findColumn(boardId: string, columnId: string) {
    return this.db.prepare(`SELECT ${COLUMN_COLS} FROM columns WHERE board_id = ? AND id = ?`)
      .get(boardId, columnId) as Column | undefined;
  }
  insertColumn(c: Column) {
    this.db.prepare(`INSERT INTO columns (id, board_id, name, sequence, created_by, created_at, updated_at)
      VALUES (@id, @boardId, @name, @sequence, @createdBy, @createdAt, @updatedAt)`).run(c);
  }
  updateColumn(c: Column) {
    this.db.prepare(`UPDATE columns SET name = @name, updated_at = @updatedAt WHERE id = @id`).run(c);
  }
  deleteColumn(columnId: string) { this.db.prepare(`DELETE FROM columns WHERE id = ?`).run(columnId); }
  setColumnSequences(seq: { id: string; sequence: number }[], at: string) {
    const stmt = this.db.prepare(`UPDATE columns SET sequence = ?, updated_at = ? WHERE id = ?`);
    for (const s of seq) stmt.run(s.sequence, at, s.id);
  }
}
