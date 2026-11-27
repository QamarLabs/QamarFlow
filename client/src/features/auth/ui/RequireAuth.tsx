import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

/** Route guard: redirects to /login (keeping the target in ?next=) when signed out. */
export default function RequireAuth() {
  const token = useAppSelector(s => s.auth.accessToken);
  const location = useLocation();
  if (!token) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <Outlet />;
}

/** Inverse guard for /, /login and /register: signed-in users go to /home. */
export function RedirectIfAuthed() {
  const token = useAppSelector(s => s.auth.accessToken);
  return token ? <Navigate to="/home" replace /> : <Outlet />;
}
