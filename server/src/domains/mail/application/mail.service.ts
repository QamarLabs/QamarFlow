import { DomainError } from '../../../shared/errors.js';
import { newId } from '../../../shared/id.js';
import { type Clock, iso } from '../../../shared/clock.js';
import type { InvitationCreated } from '../../invites/domain/invitation.js';
import { invitationTemplate, MAIL_LIMIT_PER_HOUR, type OutboundMail } from '../domain/outbound-mail.js';
import type { Mailer, OutboxRepository } from './ports.js';

export class MailService {
  constructor(private outbox: OutboxRepository, private mailer: Mailer, private clock: Clock, private clientUrl: string) {}

  /** MailRateLimiter: counts this user's outbox rows in the last hour. */
  assertCanSend(userId: string): void {
    const since = iso(new Date(this.clock.now().getTime() - 60 * 60 * 1000));
    if (this.outbox.countSince(userId, since) >= MAIL_LIMIT_PER_HOUR) {
      throw new DomainError('RATE_LIMITED', 'Mail limit reached, try again later');
    }
  }

  /** Event handler for InvitationCreated: write outbox row, then deliver. */
  async onInvitationCreated(e: InvitationCreated): Promise<void> {
    const mail: OutboundMail = {
      id: newId(), kind: 'board_invitation', toEmail: e.email, requestedBy: e.inviterId,
      invitationId: e.invitationId, status: 'queued', createdAt: iso(this.clock.now()),
    };
    this.outbox.insert(mail);
    const link = `${this.clientUrl.replace(/\/$/, '')}/invite/${encodeURIComponent(e.token)}`;
    try {
      const { providerId } = await this.mailer.send(
        invitationTemplate({ to: e.email, inviterName: e.inviterName, boardName: e.boardName, link }),
      );
      this.outbox.markSent(mail.id, providerId, iso(this.clock.now()));
    } catch (err) {
      this.outbox.markFailed(mail.id, err instanceof Error ? err.message.slice(0, 500) : 'send failed');
    }
  }
}
