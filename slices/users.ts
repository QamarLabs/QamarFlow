import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import checkEnvironment from '@/util/check-environment';
import { BoardSlice } from '@/types/boards';


type UserInitialState = {
  users: any[];
  fetching: boolean;
  status: string;
  error: string;
};

const initialState: UserInitialState = {
  users: [],
  fetching: false,
  status: 'idle',
  error: ''
};

const host = checkEnvironment();

export const fetchUsers = createAsyncThunk('users/fetchUsers', async (obj, { getState }) => {
  const { board } = getState() as { board: BoardSlice };
  let users: string[] = board.board.users ?? [];
  const createdBy = board.board.createdBy;

  users = [...users, createdBy!];

  let userPromise: Promise<any>[] = [];
  for (let i = 0; i < users.length; i++) {
    userPromise.push(fetch(`${host}/api/users/${users[i]}`));
  }

  userPromise = await Promise.all(userPromise);
  const jsonPromise: Promise<any>[] = [];

  for (let i = 0; i < userPromise.length; i++) {
    const json = (userPromise[i] as any).json();
    jsonPromise.push(json);
  }

  const usersData = await Promise.all(jsonPromise);

  return usersData;
});

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersData: () => initialState
  },
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending, state => {
        state.status = 'pending';
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.status = 'success';
        state.users = payload;
      })
      .addCase(fetchUsers.rejected, (state, { payload }: PayloadAction<any>) => {
        state.status = 'failed';
        state.error = payload && payload.error;
      });
  }
});

export const { resetUsersData } = usersSlice.actions;

export default usersSlice.reducer;
