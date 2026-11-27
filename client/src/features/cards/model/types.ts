export type Label = { type: string; bg: string };

export type Card = {
  id: string;
  boardId: string;
  columnId: string;
  title: string;
  description: string;
  type?: string;
  sequence: number;
  assigneeId?: string | null;
  label?: Label | null;
};

export type CardPatch = Partial<
  Pick<Card, 'title' | 'description' | 'assigneeId' | 'label' | 'type'>
>;

export const CARD_LABELS: Label[] = [
  { type: 'performance', bg: '#0079bf' },
  { type: 'bug', bg: '#eb5a46' },
  { type: 'feature', bg: '#61bd4f' },
  { type: 'information', bg: '#ff9f1a' },
  { type: 'warning', bg: '#f2d600' }
];
