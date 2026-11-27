import { useEffect, type PropsWithChildren } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { fetchBoards } from '@/features/boards';
import Sidebar from '@/widgets/sidebar/Sidebar';

export default function BoardsLayout({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);
  return <Sidebar>{children}</Sidebar>;
}
