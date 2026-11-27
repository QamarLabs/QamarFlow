export type Member = { id: string; fullName: string; email?: string; avatarUrl?: string | null };

export type MemberDto = { userId: string; fullName: string; email: string; avatarUrl: string | null };

/** Board members come embedded in GET /api/boards/:id (BoardDetail.members). */
export const toMember = (m: MemberDto): Member => ({
  id: m.userId,
  fullName: m.fullName,
  email: m.email,
  avatarUrl: m.avatarUrl
});
