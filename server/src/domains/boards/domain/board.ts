import { forbidden, invalid, notFound } from '../../../shared/errors.js';

export type MemberRole = 'owner' | 'member';

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  backgroundImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  sequence: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: MemberRole;
  joinedAt: string;
}

/** BoardName value object (1..200 chars after trim). */
export function boardName(raw: string): string {
  const name = raw.trim();
  if (name.length < 1 || name.length > 200) throw invalid('Board name must be 1..200 characters');
  return name;
}

/** BackgroundImage value object: http(s) URL or null. */
export function backgroundImage(raw: string | null | undefined): string | null {
  if (raw == null || raw === '') return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error();
    return u.toString();
  } catch { throw invalid('backgroundImage must be an http(s) URL'); }
}

/**
 * BoardAccessPolicy. Non-members get NOT_FOUND so board ids are not leaked;
 * members can view and edit; only the owner can delete.
 */
export const BoardAccessPolicy = {
  assertCanView(role: MemberRole | undefined): MemberRole {
    if (!role) throw notFound('Board');
    return role;
  },
  assertCanEdit(role: MemberRole | undefined): MemberRole {
    if (!role) throw notFound('Board');
    return role;
  },
  assertCanDelete(role: MemberRole | undefined): void {
    if (!role) throw notFound('Board');
    if (role !== 'owner') throw forbidden('Only the board owner can delete it');
  },
};

/** SequencePolicy: returns ids renumbered 0..N-1 in the given order. */
export const renumber = (ids: string[]): { id: string; sequence: number }[] =>
  ids.map((id, sequence) => ({ id, sequence }));

/** Validates that `next` is a permutation of `current`. */
export function assertPermutation(current: string[], next: string[]): void {
  const a = [...current].sort();
  const b = [...next].sort();
  if (a.length !== b.length || a.some((v, i) => v !== b[i]) || new Set(next).size !== next.length) {
    throw invalid('Order must contain every id of the board exactly once');
  }
}
