import { configureStore } from '@reduxjs/toolkit';
import { subscribeToken } from '@/shared/api/http';
import auth, { tokenRefreshed } from '@/features/auth/model/auth.slice';
import boards from '@/features/boards/model/boards.slice';
import board from '@/features/boards/model/board.slice';
import columns from '@/features/columns/model/columns.slice';
import cards from '@/features/cards/model/cards.slice';
import members from '@/features/members/model/members.slice';

export const store = configureStore({
  reducer: { auth, boards, board, columns, cards, members }
});

// Keep redux in sync when the http client silently refreshes the access token.
subscribeToken(token => store.dispatch(tokenRefreshed(token)));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
