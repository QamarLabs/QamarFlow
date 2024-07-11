'use client';
import React, { Component } from 'react';
import { fetchColumns } from '@/localredux/columns';
import { fetchBoard } from '@/localredux/board';
import { fetchCards } from '@/localredux/cards';
import { resetServerContext } from '@hello-pangea/dnd';
import { useSelector } from 'react-redux';
import { RootState } from '@/localredux/store';
import { useAppDispatch } from '@/hooks/index';

const BoardLayoutWrapper = ({ children, slug }: React.PropsWithChildren<{ slug: string }>) => {
  const dispatch = useAppDispatch();
  const board = useSelector((state: RootState) => state.board);
  const columns = useSelector((state: RootState) => state.columns);
  const cards = useSelector((state: RootState) => state.cards);

  React.useEffect(() => {
    const fetchData = async () => {
      resetServerContext();

      // Dispatch your actions to fetch data
      await dispatch(fetchBoard(slug));

      // Dispatch other actions
      await dispatch(fetchColumns());
      await dispatch(fetchCards());
    };

    // This is important for @hello-pangea/dnd to work
  }, []);

  return <>{children}</>;
};

export default BoardLayoutWrapper;
