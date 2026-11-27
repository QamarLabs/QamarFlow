import type { Card } from '../domain/card.js';

export interface CardRepository {
  listByBoard(boardId: string): Card[];
  idsInColumn(columnId: string): string[];
  findById(boardId: string, cardId: string): Card | undefined;
  insert(card: Card): void;
  update(card: Card): void;
  delete(cardId: string): void;
  /** Sets column + sequence for each id. */
  place(columnId: string, orderedIds: string[], at: string): void;
}

/** Port into the Boards context: does a column exist on the board? */
export interface ColumnQuery {
  columnExists(boardId: string, columnId: string): boolean;
}
