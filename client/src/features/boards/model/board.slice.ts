import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { boardsApi } from '../api/boards.api';
import type { Board, BoardPatch } from './types';

type State = {
  board: Board | null;
  /** Unsaved edits (name, background) from settings / background drawer. */
  draft: BoardPatch;
  status: 'idle' | 'pending' | 'success' | 'failed';
  isSaving: boolean;
  isDeleting: boolean;
};
const initialState: State = {
  board: null,
  draft: {},
  status: 'idle',
  isSaving: false,
  isDeleting: false
};

export const fetchBoard = createAsyncThunk('board/fetch', (id: string) => boardsApi.get(id));
export const saveBoard = createAsyncThunk('board/save', (_: void, { getState }) => {
  const { board } = getState() as { board: State };
  if (!board.board) throw new Error('No board loaded');
  return boardsApi.update(board.board.id, board.draft);
});
export const deleteBoard = createAsyncThunk('board/delete', async (id: string) => {
  await boardsApi.remove(id);
  return id;
});

const slice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    editBoard: (s, { payload }: PayloadAction<BoardPatch>) => {
      s.draft = { ...s.draft, ...payload };
    },
    resetBoard: () => initialState
  },
  extraReducers: b => {
    b.addCase(fetchBoard.pending, s => {
      s.status = 'pending';
    })
      .addCase(fetchBoard.fulfilled, (s, { payload }) => {
        s.board = payload;
        s.draft = {};
        s.status = 'success';
      })
      .addCase(fetchBoard.rejected, s => {
        s.status = 'failed';
      })
      .addCase(saveBoard.pending, s => {
        s.isSaving = true;
      })
      .addCase(saveBoard.fulfilled, (s, { payload }) => {
        s.isSaving = false;
        s.board = s.board ? { ...s.board, ...payload } : payload;
        s.draft = {};
      })
      .addCase(saveBoard.rejected, s => {
        s.isSaving = false;
      })
      .addCase(deleteBoard.pending, s => {
        s.isDeleting = true;
      })
      .addCase(deleteBoard.fulfilled, () => initialState)
      .addCase(deleteBoard.rejected, s => {
        s.isDeleting = false;
      });
  }
});

export const { editBoard, resetBoard } = slice.actions;
export default slice.reducer;
