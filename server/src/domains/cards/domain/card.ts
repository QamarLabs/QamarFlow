import sanitizeHtml from 'sanitize-html';
import { invalid } from '../../../shared/errors.js';

export interface Label { type: string; bg: string }

export interface Card {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  type: string;
  sequence: number;
  assigneeId: string | null;
  label: Label | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/** CardTitle value object. */
export function cardTitle(raw: string | undefined): string {
  const t = (raw ?? 'Add title').trim();
  if (t.length < 1 || t.length > 500) throw invalid('Card title must be 1..500 characters');
  return t;
}

/** RichTextDescription value object: Quill HTML reduced to a safe allow-list. */
export function richText(raw: string | undefined): string {
  if (!raw) return '';
  if (raw.length > 100_000) throw invalid('Description too long');
  return sanitizeHtml(raw, {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'blockquote', 'pre', 'code',
      'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'sub', 'sup'],
    allowedAttributes: { a: ['href', 'target', 'rel'], '*': ['class'] },
    allowedClasses: { '*': [/^ql-[\w-]+$/] },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }) },
  });
}

/** Label value object: both parts set, or null. */
export function label(raw: Label | null | undefined): Label | null {
  if (!raw) return null;
  const type = raw.type.trim();
  const bg = raw.bg.trim();
  if (!type || !bg || type.length > 50 || bg.length > 50) throw invalid('Label needs type and bg (<=50 chars)');
  return { type, bg };
}

/**
 * CardPlacementService: moves `cardId` from its column into `toColumn` at `toIndex`
 * and returns the renumbered (0..N-1) id lists for every affected column.
 */
export function placeCard(
  cardId: string,
  fromColumn: string[],
  toColumn: string[] | null,
  toIndex: number,
): { from: string[]; to: string[] } {
  const from = fromColumn.filter((id) => id !== cardId);
  const target = toColumn === null ? from : toColumn.filter((id) => id !== cardId);
  const idx = Math.max(0, Math.min(toIndex, target.length));
  target.splice(idx, 0, cardId);
  return { from, to: target };
}
