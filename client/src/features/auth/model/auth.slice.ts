import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { refreshAccessToken, setAccessToken } from '@/shared/api/http';
import { errorMessage } from '@/shared/lib/errors';
import { authApi } from '../api/auth.api';
import type { AuthResponse, Credentials, RegisterInput, User } from './types';

type AuthState = {
  accessToken: string | null;
  user: User | null;
  /** 'idle' before the first refresh attempt, then 'ready'. */
  bootstrap: 'idle' | 'loading' | 'ready';
  status: 'idle' | 'pending' | 'failed';
  error: string | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  bootstrap: 'idle',
  status: 'idle',
  error: null
};

async function resolveUser(res: AuthResponse): Promise<{ accessToken: string; user: User | null }> {
  setAccessToken(res.accessToken);
  if (res.user) return { accessToken: res.accessToken, user: res.user };
  const user = await authApi.me().catch(() => null);
  return { accessToken: res.accessToken, user };
}

export const login = createAsyncThunk('auth/login', async (body: Credentials, { rejectWithValue }) => {
  try {
    return await resolveUser(await authApi.login(body));
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async (body: RegisterInput, { rejectWithValue }) => {
    try {
      return await resolveUser(await authApi.register(body));
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

/** Restores a session from the httpOnly refresh cookie on app start. */
export const restoreSession = createAsyncThunk('auth/restore', async () => {
  const token = await refreshAccessToken();
  if (!token) return null;
  return resolveUser({ accessToken: token });
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout().catch(() => undefined);
  setAccessToken(null);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed: (state, { payload }: PayloadAction<string | null>) => {
      state.accessToken = payload;
      if (!payload) state.user = null;
    },
    clearAuthError: state => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    for (const thunk of [login, register]) {
      builder
        .addCase(thunk.pending, state => {
          state.status = 'pending';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, { payload }) => {
          state.status = 'idle';
          state.accessToken = payload.accessToken;
          state.user = payload.user;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'failed';
          state.error = (action.payload as string) ?? 'Request failed';
        });
    }
    builder
      .addCase(restoreSession.pending, state => {
        state.bootstrap = 'loading';
      })
      .addCase(restoreSession.fulfilled, (state, { payload }) => {
        state.bootstrap = 'ready';
        state.accessToken = payload?.accessToken ?? null;
        state.user = payload?.user ?? null;
      })
      .addCase(restoreSession.rejected, state => {
        state.bootstrap = 'ready';
      })
      .addCase(logout.fulfilled, state => {
        state.accessToken = null;
        state.user = null;
      });
  }
});

export const { tokenRefreshed, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
