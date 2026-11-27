import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { columnsApi } from '../api/columns.api';
import type { Column } from './types';

type State = {
  columns: Column[];
  status: 'idle' | 'pending' | 'success' | 'failed';
  isRequesting: boolean;
};
const initialState: State = { columns: [], status: 'idle', isRequesting: false };

const sorted = (cols: Column[]) => [...cols].sort((a, b) => a.sequence - b.sequence);

export const fetchColumns = createAsyncThunk('columns/fetch', (boardId: string) =>
  columnsApi.list(boardId)
);
export const addColumn = createAsyncThunk('columns/add', (boardId: string) =>
  columnsApi.create(boardId, 'Add title')
);
export const renameColumn = createAsyncThunk(
  'columns/rename',
  (a: { boardId: string; columnId: string; name: string }) =>
    columnsApi.update(a.boardId, a.columnId, a.name)
);
export const deleteColumn = createAsyncThunk(
  'columns/delete',
  async (a: { boardId: string; columnId: string }) => {
    await columnsApi.remove(a.boardId, a.columnId);
    return a.columnId;
  }
);
export const moveColumn = createAsyncThunk(
  'columns/move',
  async (a: { boardId: string; columnId: string; toIndex: number }, { dispatch, getState }) => {
    try {
      // The pending reducer has already applied the new order optimistically.
      const { columns } = getState() as { columns: State };
      return await columnsApi.reorder(a.boardId, columns.columns.map(c => c.id));
    } catch (e) {
      dispatch(fetchColumns(a.boardId));
      throw e;
    }
  }
);

function reorder(cols: Column[], columnId: string, toIndex: number): Column[] {
  const list = sorted(cols);
  const from = list.findIndex(c => c.id === columnId);
  if (from < 0) return list;
  const [moved] = list.splice(from, 1);
  list.splice(toIndex, 0, moved);
  return list.map((c, i) => ({ ...c, sequence: i }));
}

const slice = createSlice({
  name: 'columns',
  initialState,
  reducers: { resetColumns: () => initialState },
  extraReducers: b => {
    b.addCase(fetchColumns.pending, s => {
      s.status = 'pending';
    })
      .addCase(fetchColumns.fulfilled, (s, { payload }) => {
        s.columns = sorted(payload);
        s.status = 'success';
      })
      .addCase(fetchColumns.rejected, s => {
        s.status = 'failed';
      })
      .addCase(addColumn.pending, s => {
        s.isRequesting = true;
      })
      .addCase(addColumn.fulfilled, (s, { payload }) => {
        s.isRequesting = false;
        s.columns = sorted([...s.columns, payload]);
      })
      .addCase(addColumn.rejected, s => {
        s.isRequesting = false;
      })
      .addCase(renameColumn.fulfilled, (s, { payload, meta }) => {
        const col = s.columns.find(c => c.id === meta.arg.columnId);
        if (col) col.name = payload?.name ?? meta.arg.name;
      })
      .addCase(deleteColumn.fulfilled, (s, { payload }) => {
        s.columns = s.columns.filter(c => c.id !== payload).map((c, i) => ({ ...c, sequence: i }));
      })
      // Optimistic reorder, then reconcile with the order the server returns.
      .addCase(moveColumn.pending, (s, { meta }) => {
        s.columns = reorder(s.columns, meta.arg.columnId, meta.arg.toIndex);
      })
      .addCase(moveColumn.fulfilled, (s, { payload }) => {
        if (Array.isArray(payload) && payload.length) s.columns = sorted(payload);
      });
  }
});

export const { resetColumns } = slice.actions;
export default slice.reducer;
