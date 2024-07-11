import React, { FC } from 'react';
import { CardDetail } from '@/types/cards';
import Card from '@/components/board/columns/card';

type CardProps = {
  cards: CardDetail[];
  showCardDetail: (cardId: string) => void;
};

const Cards = ({ cards, showCardDetail }: CardProps) => {
  console.log('CARDS:', cards);
  return (
    <>
      {cards?.map((card, index) => (
        <Card key={index} card={card} cardIndex={index} showCardDetail={showCardDetail} />
      ))}
    </>
  );
};

export default Cards;
