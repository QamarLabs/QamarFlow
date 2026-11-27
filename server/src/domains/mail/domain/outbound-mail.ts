export type MailKind = 'board_invitation' | 'verify_email';
export type MailStatus = 'queued' | 'sent' | 'failed';

export interface OutboundMail {
  id: string;
  kind: MailKind;
  toEmail: string;
  requestedBy: string | null;
  invitationId: string | null;
  status: MailStatus;
  createdAt: string;
}

export interface RenderedMail { to: string; subject: string; html: string; text: string }

/** MailRateLimiter policy: max mails per requester per rolling hour. */
export const MAIL_LIMIT_PER_HOUR = 20;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** MailTemplate for board invitations. All interpolated values are HTML-escaped. */
export function invitationTemplate(p: { to: string; inviterName: string; boardName: string; link: string }): RenderedMail {
  const subject = `${p.inviterName || 'Someone'} invited you to "${p.boardName}" on QamarFlow`;
  const html = `<!doctype html><html><body style="font-family:sans-serif">
<h2>You're invited to QamarFlow</h2>
<p><strong>${esc(p.inviterName || 'A teammate')}</strong> invited you to join the board <strong>${esc(p.boardName)}</strong>.</p>
<p><a href="${esc(p.link)}" style="background:#0079bf;color:#fff;padding:10px 16px;border-radius:4px;text-decoration:none">Accept invitation</a></p>
<p>This link expires in 7 days. If you did not expect it, ignore this email.</p>
</body></html>`;
  const text = `${p.inviterName || 'A teammate'} invited you to the board "${p.boardName}". Accept: ${p.link}`;
  return { to: p.to, subject, html, text };
}
