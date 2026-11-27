import { http } from '@/shared/api/http';

export type InvitationInfo = {
  boardId: string;
  boardName?: string;
  email: string;
  inviterName?: string;
  status?: string;
  expiresAt?: string;
};

export const invitationsApi = {
  create: (boardId: string, email: string) =>
    http.post<unknown>(`/boards/${boardId}/invitations`, { email }),
  verify: async (token: string) =>
    (
      await http.get<{ invitation: InvitationInfo }>(
        `/invitations/${encodeURIComponent(token)}`,
        false
      )
    ).invitation,
  accept: (token: string) =>
    http.post<{ boardId: string }>(`/invitations/${encodeURIComponent(token)}/accept`)
};
