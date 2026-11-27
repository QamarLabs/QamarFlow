import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { boardsApi } from '../api/boards.api';
import type { Board } from './types';

type State = {
  boards: Board[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  isRequesting: boolean;
};
const initialState: State = { boards: [], status: 'idle', isRequesting: false };

export const fetchBoards = createAsyncThunk('boards/fetch', () => boardsApi.list());
export const createBoard = createAsyncThunk('boards/create', (name: string) =>
  boardsApi.create({ name })
);

const slice = createSlice({
  name: 'boards',
  initialState,
  reducers: { resetBoards: () => initialState },
  extraReducers: b => {
    b.addCase(fetchBoards.pending, s => {
      s.status = 'pending';
    })
      .addCase(fetchBoards.fulfilled, (s, { payload }) => {
        s.boards = payload;
        s.status = 'success';
      })
      .addCase(fetchBoards.rejected, s => {
        s.status = 'failed';
      })
      .addCase(createBoard.pending, s => {
        s.isRequesting = true;
      })
      .addCase(createBoard.fulfilled, (s, { payload }) => {
        s.isRequesting = false;
        s.boards.push(payload);
      })
      .addCase(createBoard.rejected, s => {
        s.isRequesting = false;
      });
  }
});

export const { resetBoards } = slice.actions;
export default slice.reducer;
