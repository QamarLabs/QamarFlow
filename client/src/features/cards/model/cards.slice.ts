import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cardsApi } from '../api/cards.api';
import type { Card, CardPatch } from './types';

type State = {
  cards: Card[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  isRequesting: boolean;
  isDeleting: boolean;
};
const initialState: State = { cards: [], status: 'idle', isRequesting: false, isDeleting: false };

export const fetchCards = createAsyncThunk('cards/fetch', (boardId: string) =>
  cardsApi.list(boardId)
);
export const addCard = createAsyncThunk('cards/add', (a: { boardId: string; columnId: string }) =>
  cardsApi.create(a.boardId, a.columnId)
);
export const updateCard = createAsyncThunk(
  'cards/update',
  (a: { boardId: string; cardId: string; patch: CardPatch }) =>
    cardsApi.update(a.boardId, a.cardId, a.patch)
);
export const deleteCard = createAsyncThunk(
  'cards/delete',
  async (a: { boardId: string; cardId: string }) => {
    await cardsApi.remove(a.boardId, a.cardId);
    return a.cardId;
  }
);
export const moveCard = createAsyncThunk(
  'cards/move',
  async (
    a: { boardId: string; cardId: string; toColumnId: string; toIndex: number },
    { dispatch }
  ) => {
    try {
      return await cardsApi.move(a.boardId, a.cardId, a.toColumnId, a.toIndex);
    } catch (e) {
      // Roll back the optimistic move by reloading the server's state.
      dispatch(fetchCards(a.boardId));
      throw e;
    }
  }
);

const bySeq = (a: Card, b: Card) => a.sequence - b.sequence;
const renumber = (list: Card[]) => list.map((c, i) => ({ ...c, sequence: i }));

function applyMove(cards: Card[], cardId: string, toColumnId: string, toIndex: number): Card[] {
  const card = cards.find(c => c.id === cardId);
  if (!card) return cards;
  const from = card.columnId;
  const others = cards.filter(c => c.columnId !== from && c.columnId !== toColumnId);
  const source = cards.filter(c => c.columnId === from && c.id !== cardId).sort(bySeq);
  const target =
    from === toColumnId ? source : cards.filter(c => c.columnId === toColumnId).sort(bySeq);
  target.splice(toIndex, 0, { ...card, columnId: toColumnId });
  return from === toColumnId
    ? [...others, ...renumber(target)]
    : [...others, ...renumber(source), ...renumber(target)];
}

const slice = createSlice({
  name: 'cards',
  initialState,
  reducers: { resetCards: () => initialState },
  extraReducers: b => {
    b.addCase(fetchCards.pending, s => {
      s.status = 'pending';
    })
      .addCase(fetchCards.fulfilled, (s, { payload }) => {
        s.cards = payload;
        s.status = 'success';
      })
      .addCase(fetchCards.rejected, s => {
        s.status = 'failed';
      })
      .addCase(addCard.pending, s => {
        s.isRequesting = true;
      })
      .addCase(addCard.fulfilled, (s, { payload }) => {
        s.isRequesting = false;
        s.cards.push(payload);
      })
      .addCase(addCard.rejected, s => {
        s.isRequesting = false;
      })
      .addCase(updateCard.pending, (s, { meta }) => {
        s.isRequesting = true;
        const card = s.cards.find(c => c.id === meta.arg.cardId);
        if (card) Object.assign(card, meta.arg.patch);
      })
      .addCase(updateCard.fulfilled, (s, { payload }) => {
        s.isRequesting = false;
        const i = s.cards.findIndex(c => c.id === payload?.id);
        if (i >= 0) s.cards[i] = { ...s.cards[i], ...payload };
      })
      .addCase(updateCard.rejected, s => {
        s.isRequesting = false;
      })
      .addCase(deleteCard.pending, s => {
        s.isDeleting = true;
      })
      .addCase(deleteCard.fulfilled, (s, { payload }) => {
        s.isDeleting = false;
        s.cards = s.cards.filter(c => c.id !== payload);
      })
      .addCase(deleteCard.rejected, s => {
        s.isDeleting = false;
      })
      .addCase(moveCard.pending, (s, { meta }) => {
        s.cards = applyMove(s.cards, meta.arg.cardId, meta.arg.toColumnId, meta.arg.toIndex);
      })
      .addCase(moveCard.fulfilled, (s, { payload }) => {
        // The server returns the whole board's cards after the move: take them as truth.
        if (Array.isArray(payload)) s.cards = payload;
      });
  }
});

export const { resetCards } = slice.actions;
export default slice.reducer;
