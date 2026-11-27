import { Router } from 'express';
import { z } from 'zod';
import { parse } from '../../../shared/http.js';
import type { MediaService } from '../application/media.service.js';

const q = z.object({ query: z.string().max(100).optional(), page: z.coerce.number().int().min(1).default(1) });

/** Mounted at /api/media (behind requireAuth). */
export function mediaRouter(media: MediaService): Router {
  const r = Router();
  r.get('/backgrounds/random', (_req, res) => { res.json({ image: media.random() }); });
  r.get('/backgrounds', async (req, res) => {
    const { query, page } = parse(q, req.query);
    res.json({ images: await media.backgrounds(query, page) });
  });
  return r;
}
