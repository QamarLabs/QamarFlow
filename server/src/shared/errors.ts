export type ErrorCode =
  | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND'
  | 'CONFLICT' | 'RATE_LIMITED' | 'INTERNAL' | 'UPSTREAM_ERROR';

const STATUS: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404,
  CONFLICT: 409, RATE_LIMITED: 429, INTERNAL: 500, UPSTREAM_ERROR: 502,
};

/** Domain/application error carrying an API error code. */
export class DomainError extends Error {
  constructor(public readonly code: ErrorCode, message: string, public readonly details?: unknown) {
    super(message);
  }
  get status(): number { return STATUS[this.code]; }
}

export const notFound = (what: string) => new DomainError('NOT_FOUND', `${what} not found`);
export const forbidden = (msg = 'Forbidden') => new DomainError('FORBIDDEN', msg);
export const conflict = (msg: string) => new DomainError('CONFLICT', msg);
export const invalid = (msg: string, details?: unknown) => new DomainError('VALIDATION_ERROR', msg, details);
export const unauthorized = (msg = 'Unauthorized') => new DomainError('UNAUTHORIZED', msg);
