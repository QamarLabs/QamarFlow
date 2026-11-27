import { Router, type RequestHandler, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { parse, param } from '../../../shared/http.js';
import { REFRESH_TTL_MS, type AuthResult, type AuthService } from '../application/auth.service.js';
import { currentUserId } from './require-auth.js';

export const REFRESH_COOKIE = 'qf_refresh';

const registerBody = z.object({
  email: z.string().max(254), password: z.string().min(8).max(128), fullName: z.string().max(200).optional(),
});
const loginBody = z.object({ email: z.string().max(254), password: z.string().max(128) });

export function authRouter(auth: AuthService, opts: { secureCookie: boolean; rateLimit: boolean }): Router {
  const r = Router();
  if (opts.rateLimit) r.use(rateLimit({
    windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-7', legacyHeaders: false,
    handler: (_req, res) => { res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Too many requests' } }); },
  }));

  const send = (res: Response, result: AuthResult, status = 200) => {
    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true, sameSite: 'lax', secure: opts.secureCookie, path: '/api/auth', maxAge: REFRESH_TTL_MS,
    });
    res.status(status).json({ accessToken: result.accessToken, user: result.user });
  };

  r.post('/register', async (req, res) => send(res, await auth.register(parse(registerBody, req.body)), 201));
  r.post('/login', async (req, res) => send(res, await auth.login(parse(loginBody, req.body))));
  r.post('/refresh', (req, res) => send(res, auth.refresh(req.cookies?.[REFRESH_COOKIE])));
  r.post('/logout', (req, res) => {
    auth.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.status(204).end();
  });
  return r;
}

export function meRoute(auth: AuthService): RequestHandler {
  return (req, res) => { res.json({ user: auth.me(currentUserId(req)) }); };
}

export function usersRouter(auth: AuthService): Router {
  const r = Router();
  r.get('/', (req, res) => {
    const { email } = parse(z.object({ email: z.string().max(254) }), req.query);
    res.json({ user: auth.findByEmail(email) });
  });
  r.get('/:id', (req, res) => { res.json({ user: auth.getUser(param(req, 'id')) }); });
  return r;
}
