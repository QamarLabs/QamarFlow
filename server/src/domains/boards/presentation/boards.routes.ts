import { Router } from 'express';
import { z } from 'zod';
import { parse, param } from '../../../shared/http.js';
import { currentUserId } from '../../identity/presentation/require-auth.js';
import type { BoardsService } from '../application/boards.service.js';

const createBody = z.object({ name: z.string(), backgroundImage: z.string().max(2048).nullish() });
const updateBody = z.object({ name: z.string().optional(), backgroundImage: z.string().max(2048).nullable().optional() });
const columnBody = z.object({ name: z.string() });
const orderBody = z.object({ columnIds: z.array(z.string()).max(500) });

/** Mounted at /api/boards (behind requireAuth). */
export function boardsRouter(boards: BoardsService): Router {
  const r = Router();
  r.get('/', (req, res) => { res.json({ boards: boards.list(currentUserId(req)) }); });
  r.post('/', (req, res) => {
    res.status(201).json({ board: boards.create(currentUserId(req), parse(createBody, req.body)) });
  });
  r.get('/:boardId', (req, res) => { res.json({ board: boards.get(currentUserId(req), param(req, 'boardId')) }); });
  r.patch('/:boardId', (req, res) => {
    res.json({ board: boards.update(currentUserId(req), param(req, 'boardId'), parse(updateBody, req.body)) });
  });
  r.delete('/:boardId', (req, res) => {
    boards.delete(currentUserId(req), param(req, 'boardId'));
    res.status(204).end();
  });

  r.get('/:boardId/columns', (req, res) => {
    res.json({ columns: boards.listColumns(currentUserId(req), param(req, 'boardId')) });
  });
  r.post('/:boardId/columns', (req, res) => {
    const { name } = parse(columnBody, req.body);
    res.status(201).json({ column: boards.addColumn(currentUserId(req), param(req, 'boardId'), name) });
  });
  // Registered before /:columnId so "order" is not captured as an id.
  r.put('/:boardId/columns/order', (req, res) => {
    const { columnIds } = parse(orderBody, req.body);
    res.json({ columns: boards.reorderColumns(currentUserId(req), param(req, 'boardId'), columnIds) });
  });
  r.patch('/:boardId/columns/:columnId', (req, res) => {
    const { name } = parse(columnBody, req.body);
    res.json({ column: boards.renameColumn(currentUserId(req), param(req, 'boardId'), param(req, 'columnId'), name) });
  });
  r.delete('/:boardId/columns/:columnId', (req, res) => {
    boards.deleteColumn(currentUserId(req), param(req, 'boardId'), param(req, 'columnId'));
    res.status(204).end();
  });
  return r;
}
