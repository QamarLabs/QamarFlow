import { invalid } from './errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Email value object (shared kernel): trimmed, lower-cased, validated. */
export function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) throw invalid('Invalid email');
  return email;
}
