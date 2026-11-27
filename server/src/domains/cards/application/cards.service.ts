import { invalid, notFound } from '../../../shared/errors.js';
import { newId } from '../../../shared/id.js';
import { type Clock, iso } from '../../../shared/clock.js';
import type { EventBus } from '../../../shared/event-bus.js';
import type { UnitOfWork } from '../../../shared/unit-of-work.js';
import type { BoardAccess } from '../../boards/application/boards.service.js';
import { cardTitle, label, placeCard, richText, type Card, type Label } from '../domain/card.js';
import type { CardRepository, ColumnQuery } from './ports.js';

export interface CardInput {
  title?: string;
  description?: string;
  type?: string;
  assigneeId?: string | null;
  label?: Label | null;
}

export class CardsService {
  constructor(
    private repo: CardRepository,
    private columns: ColumnQuery,
    private access: BoardAccess,
    private uow: UnitOfWork,
    private clock: Clock,
    private bus: EventBus,
  ) {}

  list(userId: string, boardId: string) {
    this.access.assertCanView(userId, boardId);
    return this.repo.listByBoard(boardId);
  }

  create(userId: string, boardId: string, columnId: string, input: CardInput): Card {
    this.access.assertCanEdit(userId, boardId);
    if (!this.columns.columnExists(boardId, columnId)) throw notFound('Column');
    const assigneeId = this.assignee(boardId, input.assigneeId);
    const now = iso(this.clock.now());
    const card = this.uow(() => {
      const c: Card = {
        id: newId(), boardId, columnId, title: cardTitle(input.title), description: richText(input.description),
        type: (input.type ?? '').trim().slice(0, 50), sequence: this.repo.idsInColumn(columnId).length,
        assigneeId, label: label(input.label), createdBy: userId, createdAt: now, updatedAt: now,
      };
      this.repo.insert(c);
      return c;
    });
    void this.bus.publish({ type: 'CardCreated', boardId, cardId: card.id });
    return card;
  }

  update(userId: string, boardId: string, cardId: string, input: CardInput): Card {
    this.access.assertCanEdit(userId, boardId);
    const card = this.repo.findById(boardId, cardId);
    if (!card) throw notFound('Card');
    const next: Card = {
      ...card,
      title: input.title !== undefined ? cardTitle(input.title) : card.title,
      description: input.description !== undefined ? richText(input.description) : card.description,
      type: input.type !== undefined ? input.type.trim().slice(0, 50) : card.type,
      assigneeId: input.assigneeId !== undefined ? this.assignee(boardId, input.assigneeId) : card.assigneeId,
      label: input.label !== undefined ? label(input.label) : card.label,
      updatedAt: iso(this.clock.now()),
    };
    this.repo.update(next);
    if (next.assigneeId && next.assigneeId !== card.assigneeId) {
      void this.bus.publish({ type: 'CardAssigned', boardId, cardId, assigneeId: next.assigneeId });
    }
    return next;
  }

  delete(userId: string, boardId: string, cardId: string): void {
    this.access.assertCanEdit(userId, boardId);
    const card = this.repo.findById(boardId, cardId);
    if (!card) throw notFound('Card');
    this.uow(() => {
      this.repo.delete(cardId);
      this.repo.place(card.columnId, this.repo.idsInColumn(card.columnId), iso(this.clock.now()));
    });
  }

  /** Moves a card within or between columns; renumbers both columns in one transaction. */
  move(userId: string, boardId: string, cmd: { cardId: string; toColumnId: string; toIndex: number }): Card[] {
    this.access.assertCanEdit(userId, boardId);
    const cards = this.uow(() => {
      const card = this.repo.findById(boardId, cmd.cardId);
      if (!card) throw notFound('Card');
      if (!this.columns.columnExists(boardId, cmd.toColumnId)) throw notFound('Column');
      const now = iso(this.clock.now());
      const same = card.columnId === cmd.toColumnId;
      const { from, to } = placeCard(
        card.id, this.repo.idsInColumn(card.columnId), same ? null : this.repo.idsInColumn(cmd.toColumnId), cmd.toIndex,
      );
      this.repo.place(cmd.toColumnId, to, now);
      if (!same) this.repo.place(card.columnId, from, now);
      return this.repo.listByBoard(boardId);
    });
    void this.bus.publish({ type: 'CardMoved', boardId, cardId: cmd.cardId });
    return cards;
  }

  /** AssignmentPolicy: assignee must be a board member. */
  private assignee(boardId: string, id: string | null | undefined): string | null {
    if (!id) return null;
    if (!this.access.isMember(boardId, id)) throw invalid('Assignee must be a board member');
    return id;
  }
}
