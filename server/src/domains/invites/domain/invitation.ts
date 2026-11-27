import { createHash, randomBytes } from 'node:crypto';

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Invitation {
  id: string;
  tokenHash: string;
  boardId: string;
  inviterId: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedBy: string | null;
  acceptedAt: string | null;
  createdAt: string;
}

export const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** InvitationToken: 32 random bytes; only the SHA-256 hash is ever stored. */
export function newInvitationToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString('base64url');
  return { raw, hash: hashInvitationToken(raw) };
}
export const hashInvitationToken = (raw: string) => createHash('sha256').update(raw).digest('hex');

/** Effective status: a pending invite past its expiry is expired. */
export const effectiveStatus = (inv: Invitation, now: Date): InvitationStatus =>
  inv.status === 'pending' && new Date(inv.expiresAt) <= now ? 'expired' : inv.status;

export interface InvitationCreated {
  type: 'InvitationCreated';
  invitationId: string;
  boardId: string;
  boardName: string;
  inviterId: string;
  inviterName: string;
  email: string;
  token: string;
  [key: string]: unknown;
}
