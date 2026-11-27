import { conflict, forbidden, notFound, unauthorized } from '../../../shared/errors.js';
import { newId } from '../../../shared/id.js';
import { type Clock, iso } from '../../../shared/clock.js';
import type { EventBus } from '../../../shared/event-bus.js';
import type { UnitOfWork } from '../../../shared/unit-of-work.js';
import type { BoardAccess } from '../../boards/application/boards.service.js';
import { normalizeEmail } from '../../../shared/email.js';
import {
  effectiveStatus, hashInvitationToken, INVITATION_TTL_MS, newInvitationToken,
  type Invitation, type InvitationCreated,
} from '../domain/invitation.js';
import type { InvitationRepository, MailQuota, UserDirectory } from './ports.js';

export class InvitationsService {
  constructor(
    private repo: InvitationRepository,
    private boards: BoardAccess,
    private users: UserDirectory,
    private quota: MailQuota,
    private uow: UnitOfWork,
    private clock: Clock,
    private bus: EventBus,
  ) {}

  async invite(inviterId: string, boardId: string, rawEmail: string) {
    this.boards.assertCanEdit(inviterId, boardId);
    const email = normalizeEmail(rawEmail);
    const existing = this.users.findByEmail(email);
    if (existing && this.boards.isMember(boardId, existing.id)) throw conflict('User is already a board member');
    this.quota.assertCanSend(inviterId);

    const now = this.clock.now();
    const token = newInvitationToken();
    const inv: Invitation = this.uow(() => {
      const pending = this.repo.findPending(boardId, email);
      if (pending) {
        if (effectiveStatus(pending, now) === 'expired') this.repo.markExpired(pending.id);
        else throw conflict('A pending invitation already exists for this email');
      }
      const created: Invitation = {
        id: newId(), tokenHash: token.hash, boardId, inviterId, email, status: 'pending',
        expiresAt: iso(new Date(now.getTime() + INVITATION_TTL_MS)), acceptedBy: null, acceptedAt: null,
        createdAt: iso(now),
      };
      this.repo.insert(created);
      return created;
    });

    const event: InvitationCreated = {
      type: 'InvitationCreated', invitationId: inv.id, boardId, boardName: this.boards.boardName(boardId) ?? '',
      inviterId, inviterName: this.users.displayName(inviterId), email, token: token.raw,
    };
    await this.bus.publish(event);
    return { id: inv.id, email: inv.email, status: inv.status, expiresAt: inv.expiresAt };
  }

  verify(rawToken: string) {
    const inv = this.repo.findByTokenHash(hashInvitationToken(rawToken));
    if (!inv) throw notFound('Invitation');
    return {
      boardId: inv.boardId, boardName: this.boards.boardName(inv.boardId) ?? '', email: inv.email,
      inviterName: this.users.displayName(inv.inviterId), status: effectiveStatus(inv, this.clock.now()),
      expiresAt: inv.expiresAt,
    };
  }

  accept(userId: string, rawToken: string): { boardId: string } {
    const now = this.clock.now();
    return this.uow(() => {
      const inv = this.repo.findByTokenHash(hashInvitationToken(rawToken));
      if (!inv) throw notFound('Invitation');
      const status = effectiveStatus(inv, now);
      if (status === 'expired' && inv.status === 'pending') this.repo.markExpired(inv.id);
      if (status !== 'pending') throw conflict(`Invitation is ${status}`);
      const email = this.users.emailOf(userId);
      if (!email) throw unauthorized();
      if (email.toLowerCase() !== inv.email.toLowerCase()) throw forbidden('Invitation was sent to a different email');
      this.boards.addMember(inv.boardId, userId);
      this.repo.markAccepted(inv.id, userId, iso(now));
      void this.bus.publish({ type: 'InvitationAccepted', invitationId: inv.id, boardId: inv.boardId, userId });
      return { boardId: inv.boardId };
    });
  }
}
