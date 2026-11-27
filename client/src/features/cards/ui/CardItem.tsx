import { Avatar, Badge, Box } from '@chakra-ui/react';
import { Draggable } from '@hello-pangea/dnd';
import { useAppSelector } from '@/app/hooks';
import type { Card } from '../model/types';

type Props = { card: Card; index: number; onOpen: (cardId: string) => void };

export default function CardItem({ card, index, onOpen }: Props) {
  const assignee = useAppSelector(s =>
    card.assigneeId ? s.members.members.find(m => m.id === card.assigneeId) : undefined
  );

  return (
    <Draggable draggableId={card.id} index={index}>
      {provided => (
        <Box
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          m="5px"
          p="10px"
          minHeight="80px"
          borderWidth="1px"
          bg="white"
          cursor="pointer"
          borderRadius="md"
          overflow="auto"
          _hover={{ backgroundColor: 'lightblue' }}
          onClick={() => onOpen(card.id)}>
          {card.label && (
            <Badge bg={card.label.bg} color="white">
              {card.label.type}
            </Badge>
          )}
          <p>{card.title}</p>
          {assignee && (
            <Box display="flex" justifyContent="flex-end">
              <Avatar size="xs" name={assignee.fullName} src={assignee.avatarUrl ?? undefined} />
            </Box>
          )}
        </Box>
      )}
    </Draggable>
  );
}
