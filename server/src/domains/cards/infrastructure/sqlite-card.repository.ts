import type { Db } from '../../../infrastructure/db/connection.js';
import type { Card } from '../domain/card.js';
import type { CardRepository, ColumnQuery } from '../application/ports.js';

interface Row extends Omit<Card, 'label'> { labelType: string | null; labelBg: string | null }

const COLS = `id, board_id AS boardId, column_id AS columnId, title, description, type, sequence,
  assignee_id AS assigneeId, label_type AS labelType, label_bg AS labelBg, created_by AS createdBy,
  created_at AS createdAt, updated_at AS updatedAt`;

const toCard = ({ labelType, labelBg, ...r }: Row): Card => ({
  ...r, label: labelType && labelBg ? { type: labelType, bg: labelBg } : null,
});
const toParams = (c: Card) => ({ ...c, labelType: c.label?.type ?? null, labelBg: c.label?.bg ?? null, label: undefined });

export class SqliteCardRepository implements CardRepository {
  constructor(private db: Db) {}
  listByBoard(boardId: string) {
    return (this.db.prepare(`SELECT ${COLS} FROM cards WHERE board_id = ? ORDER BY column_id, sequence`)
      .all(boardId) as Row[]).map(toCard);
  }
  idsInColumn(columnId: string) {
    return (this.db.prepare(`SELECT id FROM cards WHERE column_id = ? ORDER BY sequence, created_at`)
      .all(columnId) as { id: string }[]).map((r) => r.id);
  }
  findById(boardId: string, cardId: string) {
    const row = this.db.prepare(`SELECT ${COLS} FROM cards WHERE board_id = ? AND id = ?`).get(boardId, cardId) as Row | undefined;
    return row && toCard(row);
  }
  insert(c: Card) {
    const { label: _l, ...p } = toParams(c);
    this.db.prepare(`INSERT INTO cards (id, board_id, column_id, title, description, type, sequence, assignee_id,
      label_type, label_bg, created_by, created_at, updated_at) VALUES (@id, @boardId, @columnId, @title, @description,
      @type, @sequence, @assigneeId, @labelType, @labelBg, @createdBy, @createdAt, @updatedAt)`).run(p);
  }
  update(c: Card) {
    const { label: _l, ...p } = toParams(c);
    this.db.prepare(`UPDATE cards SET title = @title, description = @description, type = @type,
      assignee_id = @assigneeId, label_type = @labelType, label_bg = @labelBg, updated_at = @updatedAt
      WHERE id = @id`).run(p);
  }
  delete(cardId: string) { this.db.prepare(`DELETE FROM cards WHERE id = ?`).run(cardId); }
  place(columnId: string, orderedIds: string[], at: string) {
    const stmt = this.db.prepare(`UPDATE cards SET column_id = ?, sequence = ?, updated_at = ? WHERE id = ?`);
    orderedIds.forEach((id, i) => stmt.run(columnId, i, at, id));
  }
}

export class SqliteColumnQuery implements ColumnQuery {
  constructor(private db: Db) {}
  columnExists(boardId: string, columnId: string) {
    return !!this.db.prepare(`SELECT 1 FROM columns WHERE id = ? AND board_id = ?`).get(columnId, boardId);
  }
}
