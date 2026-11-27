import { http } from '@/shared/api/http';
import type { Column } from '../model/types';

const base = (boardId: string) => `/boards/${boardId}/columns`;

export const columnsApi = {
  list: async (boardId: string) => (await http.get<{ columns: Column[] }>(base(boardId))).columns,
  create: async (boardId: string, name: string) =>
    (await http.post<{ column: Column }>(base(boardId), { name })).column,
  update: async (boardId: string, columnId: string, name: string) =>
    (await http.patch<{ column: Column }>(`${base(boardId)}/${columnId}`, { name })).column,
  remove: (boardId: string, columnId: string) => http.del<void>(`${base(boardId)}/${columnId}`),
  /** Single transactional reorder: send every column id in the new order. */
  reorder: async (boardId: string, columnIds: string[]) =>
    (await http.put<{ columns: Column[] }>(`${base(boardId)}/order`, { columnIds })).columns
};
