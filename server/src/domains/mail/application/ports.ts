import type { OutboundMail, RenderedMail } from '../domain/outbound-mail.js';

export interface Mailer {
  send(mail: RenderedMail): Promise<{ providerId: string | null }>;
}

export interface OutboxRepository {
  insert(mail: OutboundMail): void;
  markSent(id: string, providerId: string | null, at: string): void;
  markFailed(id: string, error: string): void;
  countSince(requestedBy: string, sinceIso: string): number;
}
