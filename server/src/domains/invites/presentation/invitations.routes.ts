import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { parse, param } from '../../../shared/http.js';
import { currentUserId } from '../../identity/presentation/require-auth.js';
import type { InvitationsService } from '../application/invitations.service.js';

/** POST /api/boards/:boardId/invitations (behind requireAuth). */
export function boardInvitationsRouter(invites: InvitationsService): Router {
  const r = Router();
  r.post('/:boardId/invitations', async (req, res) => {
    const { email } = parse(z.object({ email: z.string().max(254) }), req.body);
    res.status(201).json({ invitation: await invites.invite(currentUserId(req), param(req, 'boardId'), email) });
  });
  return r;
}

/** /api/invitations: GET is public, accept requires auth. */
export function invitationsRouter(invites: InvitationsService, requireAuth: RequestHandler): Router {
  const r = Router();
  r.get('/:token', (req, res) => { res.json({ invitation: invites.verify(param(req, 'token')) }); });
  r.post('/:token/accept', requireAuth, (req, res) => {
    res.json(invites.accept(currentUserId(req), param(req, 'token')));
  });
  return r;
}
