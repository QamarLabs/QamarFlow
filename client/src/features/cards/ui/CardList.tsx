import { memo, useMemo } from 'react';
import { Button } from '@chakra-ui/react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { RootState } from '@/app/store';
import { addCard } from '../model/cards.slice';
import CardItem from './CardItem';

const makeSelectColumnCards = () =>
  createSelector(
    [(s: RootState) => s.cards.cards, (_: RootState, columnId: string) => columnId],
    (cards, columnId) =>
      cards.filter(c => c.columnId === columnId).sort((a, b) => a.sequence - b.sequence)
  );

type Props = { columnId: string; onOpen: (cardId: string) => void };

export const CardList = memo(function CardList({ columnId, onOpen }: Props) {
  const select = useMemo(makeSelectColumnCards, []);
  const cards = useAppSelector(s => select(s, columnId));
  return (
    <>
      {cards.map((card, index) => (
        <CardItem key={card.id} card={card} index={index} onOpen={onOpen} />
      ))}
    </>
  );
});

export function AddCardButton({ boardId, columnId }: { boardId: string; columnId: string }) {
  const dispatch = useAppDispatch();
  const isRequesting = useAppSelector(s => s.cards.isRequesting);
  return (
    <Button
      size="xs"
      my="10px"
      mx="auto"
      width="80%"
      color="black"
      variant="ghost"
      display="flex"
      isDisabled={isRequesting}
      onClick={() => dispatch(addCard({ boardId, columnId }))}>
      + Add a card
    </Button>
  );
}
