import React, { FC } from 'react';
import { Box, Badge, Avatar } from '@chakra-ui/react';
import { Draggable } from '@hello-pangea/dnd';
import { CardDetail } from '@/types/cards';
import { useAppSelector } from '@/hooks/index';

type CardProps = {
  showCardDetail: (cardId: string) => void;
  cardIndex: number;
  card: CardDetail;
};

const Card = ({ cardIndex, showCardDetail, card }: CardProps) => {
  const users = useAppSelector(state => state.users.users);
  console.log('users:', users);
  const loadAssignedToUser = () => {
    if (!card.assignedTo) return;

    const user = users.filter(user => (user as any)._id === card.assignedTo);

    return (
      <Box display="flex" justifyContent="flex-end">
        <Avatar size="xs" name={(user[0] as any).fullName} />
      </Box>
    );
  };

  return (
    // https://github.com/atlassian/react-beautiful-dnd/issues/1767
    <Draggable draggableId={card._id} index={cardIndex} key={card._id}>
      {provided => (
        <Box
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          m="5px"
          p="10px"
          id={card._id}
          minHeight="80px"
          borderWidth="1px"
          bg="white"
          cursor="pointer"
          borderRadius="md"
          overflow="auto"
          _hover={{
            backgroundColor: 'lightblue'
          }}
          onClick={() => showCardDetail(card._id)}>
          {card.label && (
            <Badge bg={card.label.type} color="white">
              {card.label.type}
            </Badge>
          )}
          <p>{card.title}</p>
          {loadAssignedToUser()}
        </Box>
      )}
    </Draggable>
  );
};

export default Card;
