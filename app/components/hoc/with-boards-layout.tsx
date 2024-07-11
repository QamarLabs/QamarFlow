'use client';
import React from 'react';
import { fetchBoards } from '@/localredux/boards';
import { useAppDispatch } from '@/hooks/index';

const BoardsWrapper = ({ children }: React.PropsWithChildren<any>) => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    (async function () {
      await dispatch(fetchBoards());
    })();
  }, []);

  return <>{children}</>;
};

export default BoardsWrapper;
