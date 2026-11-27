import type { EventBus } from '../../../shared/event-bus.js';
import type { InvitationCreated } from '../../invites/domain/invitation.js';
import type { MailService } from '../application/mail.service.js';

/** Mail has no HTTP surface (closes the old open relay); its inbound adapter is domain events. */
export function registerMailSubscriptions(bus: EventBus, mail: MailService): void {
  bus.subscribe<InvitationCreated>('InvitationCreated', (e) => mail.onInvitationCreated(e));
}
