import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import auth from '@/features/auth/model/auth.slice';
import LoginPage from './LoginPage';

// The spy records calls; the response is a plain function so a rejected
// promise is never retained by the mock's result tracking.
const api = vi.hoisted(() => ({
  login: (() => undefined) as (body: unknown) => unknown,
  spy: (() => undefined) as (body: unknown) => void
}));
vi.mock('@/features/auth/api/auth.api', () => ({
  authApi: {
    login: (body: unknown) => {
      api.spy(body);
      return api.login(body);
    },
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn()
  }
}));
const login = vi.fn();

function renderPage() {
  const store = configureStore({ reducer: { auth } });
  render(
    <Provider store={store}>
      <ChakraProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<div>home page</div>} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>
    </Provider>
  );
  return store;
}

async function fillAndSubmit(password: string) {
  await userEvent.type(screen.getByPlaceholderText('Enter email'), 'a@b.co');
  await userEvent.type(screen.getByPlaceholderText('Enter password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
    api.spy = login;
  });

  it('renders the login form', () => {
    renderPage();
    expect(screen.getByText('Log in to QamarFlow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('submits credentials and navigates home', async () => {
    api.login = async () => ({
      accessToken: 'tok',
      user: { id: 'u1', email: 'a@b.co', fullName: 'A' }
    });
    const store = renderPage();
    await fillAndSubmit('password123');
    expect(login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'password123' });
    await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument());
    expect(store.getState().auth.accessToken).toBe('tok');
  });

  it('shows the API error', async () => {
    api.login = async () => {
      throw new Error('Invalid credentials');
    };
    renderPage();
    await fillAndSubmit('wrong');
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });
});
