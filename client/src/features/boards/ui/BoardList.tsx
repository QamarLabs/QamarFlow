import { useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import BrandLink from '@/shared/ui/BrandLink';
import { createBoard } from '../model/boards.slice';

export default function BoardList() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { boards, isRequesting } = useAppSelector(s => s.boards);
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await dispatch(createBoard(name.trim()));
    if (res.meta.requestStatus === 'fulfilled') {
      setName('');
      onClose();
    }
  };

  return (
    <>
      <Button onClick={onOpen} leftIcon={<AiOutlinePlus />} colorScheme="green" size="lg" mt="1rem">
        Create a board
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleCreate}>
          <ModalHeader>Create board</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={name}
              maxLength={200}
              onChange={e => setName(e.target.value)}
              placeholder="Board name"
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button type="submit" isLoading={isRequesting} loadingText="Creating board">
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box mt="1rem" minWidth="50vw" display="flex" flexWrap="wrap">
        {boards.map(board => (
          <BrandLink key={board.id} to={`/boards/${board.id}`}>
            <Box
              mr="1rem"
              mt="1rem"
              height="150px"
              width="150px"
              background={`linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${board.backgroundImage ?? '/boards/board-background.jpg'})`}
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="cover"
              borderRadius="5px"
              boxShadow="lg"
              cursor="pointer">
              <Text
                marginTop="calc(50% - 25px)"
                height="25px"
                textAlign="center"
                textTransform="capitalize"
                color="white"
                fontSize="20px"
                fontWeight="bold">
                {board.name}
              </Text>
            </Box>
          </BrandLink>
        ))}
      </Box>
    </>
  );
}
