import type { RequestHandler, Request } from 'express';
import { unauthorized } from '../../../shared/errors.js';
import type { AuthService } from '../application/auth.service.js';

const USER_ID = Symbol('userId');
type AuthedRequest = Request & { [USER_ID]?: string };

export const requireAuth = (auth: AuthService): RequestHandler => (req, _res, next) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  const claims = scheme === 'Bearer' && token ? auth.verifyAccessToken(token) : null;
  if (!claims) return next(unauthorized());
  (req as AuthedRequest)[USER_ID] = claims.userId;
  next();
};

export const currentUserId = (req: Request): string => {
  const id = (req as AuthedRequest)[USER_ID];
  if (!id) throw unauthorized();
  return id;
};
