import type { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { DragDropContext, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { moveColumn } from '../model/columns.slice';
import type { Column as ColumnModel } from '../model/types';
import Column from './Column';
import AddColumnButton from './AddColumnButton';

type Props = {
  boardId: string;
  /** Renders the cards of one column (Draggables of type "card"). */
  renderCards: (column: ColumnModel) => ReactNode;
  renderFooter?: (column: ColumnModel) => ReactNode;
  /** Called when a card is dropped; the caller sends the single transactional move. */
  onCardDrop: (cardId: string, toColumnId: string, toIndex: number) => void;
};

export default function ColumnsBoard({ boardId, renderCards, renderFooter, onCardDrop }: Props) {
  const dispatch = useAppDispatch();
  const columns = useAppSelector(s => s.columns.columns);

  const onDragEnd = ({ destination, source, draggableId, type }: DropResult) => {
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'card') onCardDrop(draggableId, destination.droppableId, destination.index);
    if (type === 'column')
      dispatch(moveColumn({ boardId, columnId: draggableId, toIndex: destination.index }));
  };

  return (
    <Box position="relative" height="calc(100vh - 90px)" overflowX="auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="all-columns" direction="horizontal" type="column">
          {provided => (
            <Box ref={provided.innerRef} {...provided.droppableProps} display="flex" position="absolute">
              {columns.map((column, index) => (
                <Column key={column.id} column={column} index={index} footer={renderFooter?.(column)}>
                  {renderCards(column)}
                </Column>
              ))}
              {provided.placeholder}
              <AddColumnButton boardId={boardId} />
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}
