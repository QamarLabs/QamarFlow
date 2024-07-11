'use client';
import React from 'react';
import { Box } from '@chakra-ui/react';
import UserNavbar from '@/components/user-navbar';
import SubNavbar from '@/components/sub-navbar';

import { useAppDispatch, useAppSelector } from '@/hooks/index';

import BoardColumns from '@/components/board/columns';
import { resetServerContext } from '@hello-pangea/dnd';
import { fetchBoard } from '@/localredux/board';
import { fetchColumns } from '@/localredux/columns';
import { fetchCards } from '@/localredux/cards';
import { usePathname, useRouter } from 'next/navigation';

const Board = ({ params }): React.ReactNode => {
  const board = useAppSelector(state => state.board.board);
  const user = useAppSelector(state => state.user);
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    const fetchData = async () => {
      const { slug } = params;
      resetServerContext();
      // Dispatch your actions to fetch data
      await dispatch(fetchBoard(slug));

      // Dispatch other actions
      await dispatch(fetchColumns());
      await dispatch(fetchCards());
      console.log('USER:', user);
    };

    // This is important for @hello-pangea/dnd to work
    fetchData();
  }, []);

  console.log('BOARD:', board);
  return (
    <Box
      backgroundImage={`url('${board.backgroundImage}')`}
      backgroundPosition="center"
      h="100vh"
      backgroundRepeat="no-repeat"
      backgroundSize="cover">
      <UserNavbar />
      <SubNavbar />
      <BoardColumns />
    </Box>
  );
};

export default Board;
