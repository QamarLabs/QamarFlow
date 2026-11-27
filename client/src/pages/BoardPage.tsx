import { Navigate, useParams } from 'react-router-dom';
import BoardLayout from '@/widgets/board-layout/BoardLayout';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  if (!boardId) return <Navigate to="/boards" replace />;
  return <BoardLayout key={boardId} boardId={boardId} />;
}
