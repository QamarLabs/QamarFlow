import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { toMember, type Member, type MemberDto } from '../api/members.api';

type State = { members: Member[] };
const initialState: State = { members: [] };

const slice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    membersLoaded: (s, { payload }: PayloadAction<MemberDto[]>) => {
      s.members = payload.map(toMember);
    },
    resetMembers: () => initialState
  }
});

export const { membersLoaded, resetMembers } = slice.actions;
export default slice.reducer;
