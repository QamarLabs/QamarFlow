import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import boardsSlice from '@/localredux/boards';
import userSlice from '@/localredux/user';
import boardSlice from '@/localredux/board';
import columnsSlice from '@/localredux/columns';
import cardsSlice from '@/localredux/cards';
import usersSlice from '@/localredux/users';
import { useDispatch } from 'react-redux';

const createStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      boards: boardsSlice,
      board: boardSlice,
      user: userSlice,
      columns: columnsSlice,
      cards: cardsSlice,
      users: usersSlice
    },
    preloadedState
  });
};

const store = configureStore({
  reducer: {
    boards: boardsSlice,
    user: userSlice,
    board: boardSlice,
    columns: columnsSlice,
    cards: cardsSlice,
    users: usersSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
export const storeAppDispatch = useDispatch.withTypes<any>();

export default createStore;
