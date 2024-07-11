import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import checkEnvironment from '@/util/check-environment';
import { BoardSlice } from '@/types/boards';

const initialState = {
  board: {
    _id: '',
    name: '',
    columns: [],
    createdBy: '',
    dateCreated: '',
    backgroundImage: '',
    users: []
  },
  status: 'idle',
  isLoading: false,
  error: ''
};

const host = checkEnvironment();

export const saveBoard = createAsyncThunk('board/save', async (obj, { getState }) => {
  const { board } = getState() as { board: BoardSlice };

  const data = {
    _id: board.board._id,
    name: board.board.name,
    dateCreated: board.board.dateCreated,
    createdBy: board.board.createdBy,
    backgroundImage: board.board.backgroundImage
  };

  const url = `${host}/api/boards/${data._id}`;

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

  const json = await response.json();

  return json;
});

export const fetchBoard = createAsyncThunk('board/get', async (slug: string) => {
  const url = `${host}/api/boards/${slug}`;

  const response = await fetch(url);
  console.log('RESPONSE:', response);
  const json = await response.json();

  console.log('JSON:', json);
  return json;
});

export const deleteBoard = createAsyncThunk('board/delete', async (obj, { getState }) => {
  const { board } = getState() as { board: BoardSlice };
  alert(JSON.stringify(board));
  const _id = board.board._id;

  const url = `${host}/api/boards/${_id}`;

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

  const json = await response.json();

  return json;
});

export const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    updateBoardDetail: (state, { payload }) => {
      state.board[payload.type] = payload.value;
      console.log('state.board:', state.board);
    },
    resetBoard: () => initialState
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBoard.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchBoard.fulfilled, (state, { payload }) => {
        console.log('PAYLOAD:', payload);
        state.board = payload;
        state.status = 'success';
      })
      .addCase(fetchBoard.rejected, state => {
        state.status = 'failed';
      })
      .addCase(saveBoard.pending, state => {
        state.status = 'pending';
        state.isLoading = true;
      })
      .addCase(saveBoard.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.status = 'success';
      })
      .addCase(saveBoard.rejected, state => {
        state.status = 'failed';
        state.isLoading = false;
      })
      .addCase(deleteBoard.pending, state => {
        state.status = 'pending';
        state.isLoading = true;
      })
      .addCase(deleteBoard.fulfilled, state => {
        state.isLoading = false;
        state.status = 'success';
      })
      .addCase(deleteBoard.rejected, state => {
        state.status = 'failed';
        state.isLoading = false;
      });
  }
});

export const { updateBoardDetail, resetBoard } = boardSlice.actions;

export default boardSlice.reducer;
