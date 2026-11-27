import type { ErrorRequestHandler, Request } from 'express';
import { z, ZodError, type ZodType } from 'zod';
import { DomainError } from './errors.js';

export function parse<T>(schema: ZodType<T>, data: unknown): T {
  const r = schema.safeParse(data);
  if (!r.success) throw new DomainError('VALIDATION_ERROR', 'Invalid request', z.treeifyError(r.error));
  return r.data;
}

export const param = (req: Request, name: string): string => String(req.params[name]);

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof DomainError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid request' } });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Malformed JSON' } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL', message: 'Internal server error' } });
};
