import type { Board, Column, Member, MemberRole } from '../domain/board.js';

export interface BoardRepository {
  listForUser(userId: string): (Board & { role: MemberRole })[];
  findById(id: string): Board | undefined;
  roleOf(boardId: string, userId: string): MemberRole | undefined;
  insert(board: Board): void;
  update(board: Board): void;
  delete(id: string): void;
  members(boardId: string): Member[];
  addMember(boardId: string, userId: string, role: MemberRole): void;

  listColumns(boardId: string): Column[];
  findColumn(boardId: string, columnId: string): Column | undefined;
  insertColumn(column: Column): void;
  updateColumn(column: Column): void;
  deleteColumn(columnId: string): void;
  setColumnSequences(seq: { id: string; sequence: number }[], at: string): void;
}
