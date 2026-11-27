import { describe, expect, it } from 'vitest';
import reducer, { fetchCards, moveCard } from './cards.slice';
import type { Card } from './types';

const card = (id: string, columnId: string, sequence: number): Card => ({
  id,
  boardId: 'b',
  columnId,
  title: id,
  description: '',
  sequence
});
const seeded = () =>
  reducer(
    undefined,
    fetchCards.fulfilled([card('a', 'c1', 0), card('b', 'c1', 1), card('c', 'c2', 0)], 'r', 'b')
  );
const col = (cards: Card[], c: string) =>
  cards
    .filter(x => x.columnId === c)
    .sort((x, y) => x.sequence - y.sequence)
    .map(x => `${x.id}${x.sequence}`);

describe('cards slice optimistic move', () => {
  it('moves a card to another column on pending and renumbers both', () => {
    const arg = { boardId: 'b', cardId: 'a', toColumnId: 'c2', toIndex: 1 };
    const s = reducer(seeded(), moveCard.pending('r', arg));
    expect(col(s.cards, 'c1')).toEqual(['b0']);
    expect(col(s.cards, 'c2')).toEqual(['c0', 'a1']);
  });

  it('reorders within the same column', () => {
    const arg = { boardId: 'b', cardId: 'b', toColumnId: 'c1', toIndex: 0 };
    const s = reducer(seeded(), moveCard.pending('r', arg));
    expect(col(s.cards, 'c1')).toEqual(['b0', 'a1']);
  });

  it('takes the server result as truth when fulfilled', () => {
    const arg = { boardId: 'b', cardId: 'a', toColumnId: 'c2', toIndex: 0 };
    const server = [card('a', 'c2', 0)];
    let s = reducer(seeded(), moveCard.pending('r', arg));
    s = reducer(s, moveCard.fulfilled(server as never, 'r', arg));
    expect(s.cards).toEqual(server);
  });
});
