import { Router } from 'express';
import { z } from 'zod';
import { parse, param } from '../../../shared/http.js';
import { currentUserId } from '../../identity/presentation/require-auth.js';
import type { CardsService } from '../application/cards.service.js';

const labelSchema = z.object({ type: z.string(), bg: z.string() }).nullable();
const cardBody = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  label: labelSchema.optional(),
});
const moveBody = z.object({ cardId: z.string(), toColumnId: z.string(), toIndex: z.number().int().min(0) });

/** Mounted at /api/boards (behind requireAuth). */
export function cardsRouter(cards: CardsService): Router {
  const r = Router();
  r.get('/:boardId/cards', (req, res) => { res.json({ cards: cards.list(currentUserId(req), param(req, 'boardId')) }); });
  r.post('/:boardId/columns/:columnId/cards', (req, res) => {
    const card = cards.create(currentUserId(req), param(req, 'boardId'), param(req, 'columnId'), parse(cardBody, req.body));
    res.status(201).json({ card });
  });
  r.put('/:boardId/cards/order', (req, res) => {
    res.json({ cards: cards.move(currentUserId(req), param(req, 'boardId'), parse(moveBody, req.body)) });
  });
  r.patch('/:boardId/cards/:cardId', (req, res) => {
    const card = cards.update(currentUserId(req), param(req, 'boardId'), param(req, 'cardId'), parse(cardBody, req.body));
    res.json({ card });
  });
  r.delete('/:boardId/cards/:cardId', (req, res) => {
    cards.delete(currentUserId(req), param(req, 'boardId'), param(req, 'cardId'));
    res.status(204).end();
  });
  return r;
}
