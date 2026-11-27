import { lazy, Suspense, useState } from 'react';
import {
  Spinner,
  Badge,
  Box,
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text
} from '@chakra-ui/react';
import { AiOutlineClose, AiOutlineDelete, AiOutlineDown, AiOutlineLaptop } from 'react-icons/ai';
import { GrTextAlignFull } from 'react-icons/gr';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
const RichTextEditor = lazy(() => import('@/shared/ui/RichTextEditor'));
import { deleteCard, updateCard } from '../model/cards.slice';
import type { Card, CardPatch, Label } from '../model/types';
import CardLabelsMenu from './CardLabelsMenu';

type Props = { card: Card; isOpen: boolean; onClose: () => void };

export default function CardDetailsModal({ card, isOpen, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const { isRequesting, isDeleting } = useAppSelector(s => s.cards);
  const members = useAppSelector(s => s.members.members);

  const patch = (p: CardPatch) => dispatch(updateCard({ boardId: card.boardId, cardId: card.id, patch: p }));

  const handleClose = async () => {
    if (title !== card.title || description !== (card.description ?? '')) {
      await patch({ title, description });
    }
    onClose();
  };

  const handleDelete = async () => {
    await dispatch(deleteCard({ boardId: card.boardId, cardId: card.id }));
    onClose();
  };

  return (
    <Modal size="xl" onClose={handleClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent maxW="64rem">
        <ModalBody>
          {card.label && (
            <Badge bg={card.label.bg} color="white">
              {card.label.type}
            </Badge>
          )}
          <Box display="flex" marginTop="1rem" alignItems="center">
            <AiOutlineLaptop />
            <Input
              name="title"
              size="sm"
              marginLeft="1rem"
              value={title}
              fontWeight="bold"
              onChange={e => setTitle(e.target.value)}
              placeholder="Card title"
            />
          </Box>
          <Box display="flex">
            <Box width="100%" marginTop="2rem">
              <Box display="flex" fontWeight="bold" alignItems="center">
                <GrTextAlignFull />
                <Text marginLeft="1rem">Description</Text>
              </Box>
              <Box marginLeft="1.5rem" minHeight="200px" width="90%">
                <Suspense fallback={<Spinner />}><RichTextEditor value={description} onChange={setDescription} /></Suspense>
              </Box>
            </Box>
            <Box display="flex" flexDirection="column">
              <CardLabelsMenu onSelect={(label: Label | null) => patch({ label })} />
              <Menu>
                <MenuButton as={Button} size="xs" rightIcon={<AiOutlineDown />}>
                  Assign To
                </MenuButton>
                <MenuList>
                  {members.map(m => (
                    <MenuItem key={m.id} onClick={() => patch({ assigneeId: m.id })}>
                      {m.fullName || m.email}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={() => patch({ assigneeId: null })}>Unassign</MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button
            size="xs"
            marginRight="1rem"
            onClick={handleDelete}
            isLoading={isDeleting}
            loadingText="Deleting"
            bg="red.500"
            color="white"
            aria-label="Delete card"
            _hover={{ backgroundColor: 'red.600' }}>
            <AiOutlineDelete />
          </Button>
          <Button size="xs" onClick={handleClose} isLoading={isRequesting} loadingText="Updating">
            <AiOutlineClose /> Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
