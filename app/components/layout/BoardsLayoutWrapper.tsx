'use client';
import React from 'react';
import { fetchBoards } from '@/localredux/boards';
import { useAppDispatch } from '@/hooks/index';
import { usePathname } from 'next/navigation';

const BoardsLayoutWrapper = ({ children }: React.PropsWithChildren<any>) => {
  const dispatch = useAppDispatch();
  // const pathname = usePathname();

  React.useEffect(() => {
    async function getBoards() {
      await dispatch(fetchBoards());
    }
    getBoards();
  }, []);

  return <>{children}</>;
};

export default BoardsLayoutWrapper;
