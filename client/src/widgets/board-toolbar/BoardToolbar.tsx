import { Avatar, Box, Heading, Tooltip } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { BoardSettingsMenu, editBoard, saveBoard } from '@/features/boards';
import { InviteMemberModal } from '@/features/invitations';
import { BackgroundDrawer } from '@/features/backgrounds';

export default function BoardToolbar() {
  const dispatch = useAppDispatch();
  const { board, draft, isSaving } = useAppSelector(s => s.board);
  const members = useAppSelector(s => s.members.members);
  if (!board) return null;

  return (
    <Box height="40px" display="flex" alignItems="center" justifyContent="space-between" bg="rgba(0,0,0,0.1)">
      <Heading ml="0.5rem" color="white" as="h4" size="sm" whiteSpace="nowrap">
        {board.name}
      </Heading>
      <Box>
        {members.map(m => (
          <Tooltip label={m.fullName || m.email} key={m.id}>
            <Avatar size="sm" name={m.fullName || m.email} mr="5px" src={m.avatarUrl ?? undefined} />
          </Tooltip>
        ))}
      </Box>
      <Box>
        <InviteMemberModal boardId={board.id} />
        <BoardSettingsMenu />
        <BackgroundDrawer
          selected={draft.backgroundImage ?? board.backgroundImage}
          onSelect={url => dispatch(editBoard({ backgroundImage: url }))}
          onSave={() => dispatch(saveBoard())}
          isSaving={isSaving}
        />
      </Box>
    </Box>
  );
}
