import sgMail from '@sendgrid/mail';
import type { Db } from '../../../infrastructure/db/connection.js';
import type { OutboundMail, RenderedMail } from '../domain/outbound-mail.js';
import type { Mailer, OutboxRepository } from '../application/ports.js';

/** SendGrid adapter (ACL around @sendgrid/mail). */
export class SendGridMailer implements Mailer {
  constructor(apiKey: string, private from: string) { sgMail.setApiKey(apiKey); }
  async send(m: RenderedMail) {
    const [res] = await sgMail.send({ to: m.to, from: this.from, subject: m.subject, html: m.html, text: m.text });
    return { providerId: (res.headers?.['x-message-id'] as string | undefined) ?? null };
  }
}

/** Development fallback when SENDGRID_API_KEY is missing: prints the mail. */
export class ConsoleMailer implements Mailer {
  constructor(private log: (msg: string) => void = console.log) {}
  async send(m: RenderedMail) {
    this.log(`[mail] to=${m.to} subject="${m.subject}"\n${m.text}`);
    return { providerId: null };
  }
}

/** Collects mails in memory (tests). */
export class MemoryMailer implements Mailer {
  sent: RenderedMail[] = [];
  async send(m: RenderedMail) { this.sent.push(m); return { providerId: null }; }
}

export class SqliteOutboxRepository implements OutboxRepository {
  constructor(private db: Db) {}
  insert(m: OutboundMail) {
    this.db.prepare(`INSERT INTO mail_outbox (id, kind, to_email, requested_by, invitation_id, status, created_at)
      VALUES (@id, @kind, @toEmail, @requestedBy, @invitationId, @status, @createdAt)`).run(m);
  }
  markSent(id: string, providerId: string | null, at: string) {
    this.db.prepare(`UPDATE mail_outbox SET status = 'sent', provider_id = ?, sent_at = ? WHERE id = ?`).run(providerId, at, id);
  }
  markFailed(id: string, error: string) {
    this.db.prepare(`UPDATE mail_outbox SET status = 'failed', error = ? WHERE id = ?`).run(error, id);
  }
  countSince(requestedBy: string, sinceIso: string) {
    return (this.db.prepare(`SELECT COUNT(*) AS n FROM mail_outbox WHERE requested_by = ? AND created_at >= ?`)
      .get(requestedBy, sinceIso) as { n: number }).n;
  }
}
