import type { Invitation } from '../domain/invitation.js';

export interface InvitationRepository {
  insert(inv: Invitation): void;
  findByTokenHash(hash: string): Invitation | undefined;
  findPending(boardId: string, email: string): Invitation | undefined;
  markExpired(id: string): void;
  markAccepted(id: string, userId: string, at: string): void;
}

/** Port into Identity. */
export interface UserDirectory {
  findByEmail(email: string): { id: string } | null;
  emailOf(userId: string): string | undefined;
  displayName(userId: string): string;
}

/** Port into Mail: throws RATE_LIMITED when the inviter exceeded the quota. */
export interface MailQuota {
  assertCanSend(userId: string): void;
}
