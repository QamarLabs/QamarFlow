import { BoardList } from '@/features/boards';
import BoardsLayout from '@/widgets/boards-layout/BoardsLayout';
import Header from '@/widgets/header/Header';

export default function BoardsPage() {
  return (
    <BoardsLayout>
      <Header title="Boards" />
      <BoardList />
    </BoardsLayout>
  );
}
