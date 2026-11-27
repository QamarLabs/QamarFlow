import { http } from '@/shared/api/http';
import type { Card, CardPatch } from '../model/types';

export const cardsApi = {
  list: async (boardId: string) =>
    (await http.get<{ cards: Card[] }>(`/boards/${boardId}/cards`)).cards,
  create: async (boardId: string, columnId: string) =>
    (
      await http.post<{ card: Card }>(`/boards/${boardId}/columns/${columnId}/cards`, {
        title: 'Add title'
      })
    ).card,
  update: async (boardId: string, cardId: string, patch: CardPatch) =>
    (await http.patch<{ card: Card }>(`/boards/${boardId}/cards/${cardId}`, patch)).card,
  remove: (boardId: string, cardId: string) =>
    http.del<void>(`/boards/${boardId}/cards/${cardId}`),
  /** Single transactional move; returns every card of the board after the move. */
  move: async (boardId: string, cardId: string, toColumnId: string, toIndex: number) =>
    (
      await http.put<{ cards: Card[] }>(`/boards/${boardId}/cards/order`, {
        cardId,
        toColumnId,
        toIndex
      })
    ).cards
};
