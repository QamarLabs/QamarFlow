import { invalid, notFound } from '../../../shared/errors.js';
import { newId } from '../../../shared/id.js';
import { type Clock, iso } from '../../../shared/clock.js';
import type { EventBus } from '../../../shared/event-bus.js';
import type { UnitOfWork } from '../../../shared/unit-of-work.js';
import {
  assertPermutation, backgroundImage, boardName, BoardAccessPolicy, renumber,
  type Board, type Column, type MemberRole,
} from '../domain/board.js';
import type { BoardRepository } from './ports.js';

/**
 * Public application API of the Boards context. Other contexts (Cards, Invites)
 * depend on `BoardAccess` only, never on the repository.
 */
export interface BoardAccess {
  assertCanView(userId: string, boardId: string): MemberRole;
  assertCanEdit(userId: string, boardId: string): MemberRole;
  isMember(boardId: string, userId: string): boolean;
  boardName(boardId: string): string | undefined;
  addMember(boardId: string, userId: string): void;
}

export class BoardsService implements BoardAccess {
  constructor(private repo: BoardRepository, private uow: UnitOfWork, private clock: Clock, private bus: EventBus) {}

  // ---- access (used by other contexts) ----
  assertCanView(userId: string, boardId: string): MemberRole {
    return BoardAccessPolicy.assertCanView(this.repo.roleOf(boardId, userId));
  }
  assertCanEdit(userId: string, boardId: string): MemberRole {
    return BoardAccessPolicy.assertCanEdit(this.repo.roleOf(boardId, userId));
  }
  isMember(boardId: string, userId: string) { return !!this.repo.roleOf(boardId, userId); }
  boardName(boardId: string) { return this.repo.findById(boardId)?.name; }
  addMember(boardId: string, userId: string) {
    if (this.repo.roleOf(boardId, userId)) return;
    this.repo.addMember(boardId, userId, 'member');
    void this.bus.publish({ type: 'MemberAdded', boardId, userId });
  }

  // ---- boards ----
  list(userId: string) { return this.repo.listForUser(userId); }

  create(userId: string, input: { name: string; backgroundImage?: string | null }) {
    const now = iso(this.clock.now());
    const board: Board = {
      id: newId(), name: boardName(input.name), ownerId: userId,
      backgroundImage: backgroundImage(input.backgroundImage), createdAt: now, updatedAt: now,
    };
    // Invariant: owner is always a member.
    this.uow(() => { this.repo.insert(board); this.repo.addMember(board.id, userId, 'owner'); });
    void this.bus.publish({ type: 'BoardCreated', boardId: board.id });
    return { ...board, role: 'owner' as const };
  }

  get(userId: string, boardId: string) {
    const role = this.assertCanView(userId, boardId);
    const board = this.repo.findById(boardId)!;
    return { ...board, role, members: this.repo.members(boardId), columns: this.repo.listColumns(boardId) };
  }

  update(userId: string, boardId: string, input: { name?: string; backgroundImage?: string | null }) {
    const role = this.assertCanEdit(userId, boardId);
    const board = this.repo.findById(boardId)!;
    const next: Board = {
      ...board,
      name: input.name !== undefined ? boardName(input.name) : board.name,
      backgroundImage: input.backgroundImage !== undefined ? backgroundImage(input.backgroundImage) : board.backgroundImage,
      updatedAt: iso(this.clock.now()),
    };
    this.repo.update(next);
    return { ...next, role };
  }

  delete(userId: string, boardId: string) {
    BoardAccessPolicy.assertCanDelete(this.repo.roleOf(boardId, userId));
    this.repo.delete(boardId); // FK cascade removes members, columns, cards, invitations
    void this.bus.publish({ type: 'BoardDeleted', boardId });
  }

  // ---- columns ----
  listColumns(userId: string, boardId: string) {
    this.assertCanView(userId, boardId);
    return this.repo.listColumns(boardId);
  }

  addColumn(userId: string, boardId: string, name: string): Column {
    this.assertCanEdit(userId, boardId);
    const now = iso(this.clock.now());
    return this.uow(() => {
      const column: Column = {
        id: newId(), boardId, name: columnName(name), sequence: this.repo.listColumns(boardId).length,
        createdBy: userId, createdAt: now, updatedAt: now,
      };
      this.repo.insertColumn(column);
      return column;
    });
  }

  renameColumn(userId: string, boardId: string, columnId: string, name: string): Column {
    this.assertCanEdit(userId, boardId);
    const col = this.repo.findColumn(boardId, columnId);
    if (!col) throw notFound('Column');
    const next = { ...col, name: columnName(name), updatedAt: iso(this.clock.now()) };
    this.repo.updateColumn(next);
    return next;
  }

  deleteColumn(userId: string, boardId: string, columnId: string): void {
    this.assertCanEdit(userId, boardId);
    if (!this.repo.findColumn(boardId, columnId)) throw notFound('Column');
    this.uow(() => {
      this.repo.deleteColumn(columnId);
      const remaining = this.repo.listColumns(boardId).map((c) => c.id);
      this.repo.setColumnSequences(renumber(remaining), iso(this.clock.now()));
    });
    void this.bus.publish({ type: 'ColumnDeleted', boardId, columnId });
  }

  reorderColumns(userId: string, boardId: string, columnIds: string[]): Column[] {
    this.assertCanEdit(userId, boardId);
    return this.uow(() => {
      assertPermutation(this.repo.listColumns(boardId).map((c) => c.id), columnIds);
      this.repo.setColumnSequences(renumber(columnIds), iso(this.clock.now()));
      return this.repo.listColumns(boardId);
    });
  }
}

function columnName(raw: string): string {
  const name = raw.trim();
  if (name.length < 1 || name.length > 200) throw invalid('Column name must be 1..200 characters');
  return name;
}

