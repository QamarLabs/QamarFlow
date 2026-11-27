import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { RedirectIfAuthed, RequireAuth } from '@/features/auth';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ErrorPage from '@/pages/ErrorPage';

const HomePage = lazy(() => import('@/pages/HomePage'));
const BoardsPage = lazy(() => import('@/pages/BoardsPage'));
const BoardPage = lazy(() => import('@/pages/BoardPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));
const AcceptInvitationPage = lazy(() => import('@/pages/AcceptInvitationPage'));

const load = (node: ReactNode) => (
  <Suspense
    fallback={
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    }>
    {node}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/signup', element: <Navigate to="/register" replace /> }
    ]
  },
  { path: '/invite/:token', element: load(<AcceptInvitationPage />) },
  {
    element: <RequireAuth />,
    children: [
      { path: '/home', element: load(<HomePage />) },
      { path: '/boards', element: load(<BoardsPage />) },
      { path: '/boards/:boardId', element: load(<BoardPage />) },
      { path: '/settings', element: load(<SettingsPage />) },
      { path: '/templates', element: load(<TemplatesPage />) }
    ]
  },
  { path: '/error', element: <ErrorPage /> },
  { path: '*', element: <ErrorPage message="Page not found" /> }
]);
