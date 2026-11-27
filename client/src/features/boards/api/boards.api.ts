import { http } from '@/shared/api/http';
import type { Board, BoardPatch } from '../model/types';

/** Server responses are enveloped: { boards }, { board }. See server/API.md. */
export const boardsApi = {
  list: async () => (await http.get<{ boards: Board[] }>('/boards')).boards,
  create: async (body: { name: string; backgroundImage?: string | null }) =>
    (await http.post<{ board: Board }>('/boards', body)).board,
  get: async (id: string) => (await http.get<{ board: Board }>(`/boards/${id}`)).board,
  update: async (id: string, body: BoardPatch) =>
    (await http.patch<{ board: Board }>(`/boards/${id}`, body)).board,
  remove: (id: string) => http.del<void>(`/boards/${id}`)
};
