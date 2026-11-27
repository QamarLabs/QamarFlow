import { describe, expect, it } from 'vitest';
import reducer, { clearAuthError, login, logout, restoreSession, tokenRefreshed } from './auth.slice';
import type { User } from './types';

const init = () => reducer(undefined, { type: '@@init' });
const user = { id: 'u1', email: 'a@b.c', fullName: 'A' } as unknown as User;

describe('auth slice', () => {
  it('starts logged out', () => {
    expect(init()).toMatchObject({ accessToken: null, user: null, bootstrap: 'idle', status: 'idle' });
  });

  it('tokenRefreshed sets the token and clears the user when null', () => {
    let s = reducer(
      init(),
      login.fulfilled({ accessToken: 't1', user }, 'r', { email: '', password: '' })
    );
    s = reducer(s, tokenRefreshed('t2'));
    expect(s.accessToken).toBe('t2');
    expect(s.user).toEqual(user);
    s = reducer(s, tokenRefreshed(null));
    expect(s).toMatchObject({ accessToken: null, user: null });
  });

  it('handles login pending, rejected and clearAuthError', () => {
    const arg = { email: 'a', password: 'b' };
    let s = reducer(init(), login.pending('r', arg));
    expect(s.status).toBe('pending');
    s = reducer(s, login.rejected(null, 'r', arg, 'Bad credentials'));
    expect(s).toMatchObject({ status: 'failed', error: 'Bad credentials' });
    s = reducer(s, clearAuthError());
    expect(s.error).toBeNull();
  });

  it('restoreSession marks bootstrap ready and logout clears state', () => {
    let s = reducer(init(), restoreSession.pending('r'));
    expect(s.bootstrap).toBe('loading');
    s = reducer(s, restoreSession.fulfilled({ accessToken: 't', user }, 'r'));
    expect(s).toMatchObject({ bootstrap: 'ready', accessToken: 't', user });
    s = reducer(s, logout.fulfilled(undefined, 'r'));
    expect(s).toMatchObject({ accessToken: null, user: null });
  });
});
