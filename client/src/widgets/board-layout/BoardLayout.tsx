import { useCallback, useEffect, useState } from 'react';
import { Box, Center, Spinner, Text } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchBoard, resetBoard } from '@/features/boards';
import { ColumnsBoard, fetchColumns, resetColumns } from '@/features/columns';
import { AddCardButton, CardDetailsModal, CardList, fetchCards, moveCard, resetCards } from '@/features/cards';
import { membersLoaded, resetMembers } from '@/features/members';
import UserMenu from '@/widgets/navbar/UserMenu';
import BoardToolbar from '@/widgets/board-toolbar/BoardToolbar';
import Header from '@/widgets/header/Header';

/** Loads a board with its columns, cards and members and composes the board UI. */
export default function BoardLayout({ boardId }: { boardId: string }) {
  const dispatch = useAppDispatch();
  const { board, draft, status } = useAppSelector(s => s.board);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const openCard = useAppSelector(s => s.cards.cards.find(c => c.id === openCardId));

  useEffect(() => {
    dispatch(fetchBoard(boardId)).then(action => {
      if (fetchBoard.fulfilled.match(action)) {
        dispatch(membersLoaded(action.payload.members ?? []));
      }
    });
    dispatch(fetchColumns(boardId));
    dispatch(fetchCards(boardId));
    return () => {
      dispatch(resetBoard());
      dispatch(resetColumns());
      dispatch(resetCards());
      dispatch(resetMembers());
    };
  }, [boardId, dispatch]);

  const onCardDrop = useCallback(
    (cardId: string, toColumnId: string, toIndex: number) =>
      dispatch(moveCard({ boardId, cardId, toColumnId, toIndex })),
    [boardId, dispatch]
  );

  if (status === 'failed') {
    return (
      <Center h="100vh">
        <Text>Board not found or you do not have access.</Text>
      </Center>
    );
  }
  if (!board) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const background = draft.backgroundImage ?? board.backgroundImage ?? '/boards/board-background.jpg';

  return (
    <Box
      backgroundImage={`url('${background}')`}
      backgroundPosition="center"
      h="100vh"
      backgroundRepeat="no-repeat"
      backgroundSize="cover">
      <Header title={board.name} />
      <UserMenu />
      <BoardToolbar />
      <ColumnsBoard
        boardId={boardId}
        onCardDrop={onCardDrop}
        renderCards={column => <CardList columnId={column.id} onOpen={setOpenCardId} />}
        renderFooter={column => <AddCardButton boardId={boardId} columnId={column.id} />}
      />
      {openCard && (
        <CardDetailsModal key={openCard.id} card={openCard} isOpen onClose={() => setOpenCardId(null)} />
      )}
    </Box>
  );
}
