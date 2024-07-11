import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import checkEnvironment from '@/util/check-environment';
import { SingleUser } from '@/types/user';
import { CardDetail, CardSlice } from '@/types/cards';

import { BoardSlice } from '@/types/boards';
import shortId from 'shortid';
import findIndex from 'lodash.findindex';

type CardPatch = {
  _id: string;
  title?: string;
  description?: string;
  columnId?: string;
  assignedTo?: string;
  sequence?: number;
};

const initialState = {
  cards: [],
  status: 'idle',
  isRequesting: false,
  isDeleting: false,
  doneFetching: true,
  error: {}
};

const host = checkEnvironment();

export const fetchCards = createAsyncThunk('cards/fetchCards', async (_obj, { getState }) => {
  const { board } = getState() as { board: BoardSlice };
  const url = `${host}/api/boards/${board.board._id}/cards`;
  const response = await fetch(url).then(response => response.json());

  return response;
});

export const deleteCard = createAsyncThunk(
  'card/deleteCard',
  async (cardId: string, { getState }) => {
    const { board } = getState() as { board: BoardSlice };

    const url = `${host}/api/boards/${board.board._id}/cards/${cardId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });

    const inJSON = await response.json();

    return inJSON;
  }
);

export const addCard = createAsyncThunk('card/addCard', async (columnId: string, { getState }) => {
  const { board } = getState() as { board: BoardSlice };
  const { user } = getState() as { user: SingleUser };
  const { cards } = getState() as { cards: CardSlice };

  const filteredCards: CardDetail[] = cards.cards.filter(card => card.columnId === columnId);

  let sequence = 1;

  if (filteredCards.length > 0) {
    sequence = filteredCards![filteredCards.length - 1].sequence! + 1;
  }

  const cardId = shortId.generate();

  const data = {
    id: cardId,
    columnId: columnId,
    boardId: board.board._id,
    title: 'Add title',
    type: '',
    description: '',
    dateCreated: new Date().toLocaleString(),
    userId: user.id,
    assignedTo: '',
    sequence
  };

  const url = `${host}/api/boards/${data.boardId}/columns/${columnId}/cards`;

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });

  const inJSON = await response.json();

  return inJSON;
});

export const updateCard = createAsyncThunk(
  'card/updateCard',
  async (obj: CardPatch, { getState }) => {
    const { board } = getState() as { board: BoardSlice };

    const url = `${host}/api/boards/${board.board._id}/cards/${obj._id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(obj)
    });

    const inJSON = await response.json();

    return inJSON;
  }
);

export const updateCardSequence = createAsyncThunk(
  'card/updateCardSequence',
  async (obj: CardPatch, { getState }) => {
    const { board } = getState() as { board: BoardSlice };
    const { _id, title, description, columnId, sequence } = obj;

    const data = {
      title,
      description,
      columnId,
      sequence
    };

    const url = `${host}/api/boards/${board.board._id}/cards/${_id}`;

    const response = await fetch(url, {
      method: 'PATCH',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    });

    const inJSON = await response.json();

    return inJSON;
  }
);

export const cardsSlice = createSlice({
  name: 'cards',
  initialState: initialState,
  reducers: {
    resetCards: () => initialState,
    updateCardSequenceToLocalState: (state, { payload }) => {
      const cardIndex = findIndex(state.cards, { _id: payload._id });

      (state.cards[cardIndex] as any).sequence = payload.sequence;
      (state.cards[cardIndex] as any).columnId = payload.columnId;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(addCard.pending, state => {
        state.isRequesting = true;
        state.status = 'pending';
      })
      .addCase(addCard.fulfilled, state => {
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(addCard.rejected, state => {
        state.status = 'failed';
        state.isRequesting = false;
      })
      .addCase(fetchCards.pending, state => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(fetchCards.fulfilled, (state, { payload }) => {
        state.cards = payload;
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(fetchCards.rejected, state => {
        state.status = 'failed';
        state.isRequesting = false;
      })
      .addCase(deleteCard.pending, state => {
        state.status = 'pending';
        state.isDeleting = true;
      })
      .addCase(deleteCard.fulfilled, state => {
        state.status = 'success';
        state.isDeleting = false;
      })
      .addCase(deleteCard.rejected, state => {
        state.status = 'failed';
        state.isDeleting = false;
      })
      .addCase(updateCard.pending, state => {
        state.status = 'pending';
        state.isRequesting = true;
      })
      .addCase(updateCard.fulfilled, state => {
        state.status = 'success';
        state.isRequesting = false;
      })
      .addCase(updateCard.rejected, state => {
        state.status = 'failed';
        state.isRequesting = false;
      })
      .addCase(updateCardSequence.pending, state => {
        state.status = 'pending';
      })
      .addCase(updateCardSequence.fulfilled, state => {
        state.status = 'success';
      })
      .addCase(updateCardSequence.rejected, state => {
        state.status = 'failed';
      });
  }
});

export const { resetCards, updateCardSequenceToLocalState } = cardsSlice.actions;

export default cardsSlice.reducer;
