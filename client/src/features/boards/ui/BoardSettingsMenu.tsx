import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure
} from '@chakra-ui/react';
import { AiFillSetting, AiOutlineCheck, AiOutlineDelete } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { deleteBoard, editBoard, saveBoard } from '../model/board.slice';

export default function BoardSettingsMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { board, draft, isSaving, isDeleting } = useAppSelector(s => s.board);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!board) return null;

  const handleSave = async () => {
    await dispatch(saveBoard());
    onClose();
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete board "${board.name}"? This cannot be undone.`)) return;
    const res = await dispatch(deleteBoard(board.id));
    if (res.meta.requestStatus === 'fulfilled') navigate('/boards');
  };

  return (
    <>
      <Button onClick={onOpen} size="xs" m="5px" aria-label="Board settings">
        <AiFillSetting />
      </Button>
      <Modal onClose={onClose} isOpen={isOpen} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Board Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs isFitted variant="enclosed">
              <TabList mb="2rem">
                <Tab>Basic</Tab>
                <Tab>Advanced</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <FormControl>
                    <FormLabel>Board name</FormLabel>
                    <Input
                      value={draft.name ?? board.name}
                      maxLength={200}
                      onChange={e => dispatch(editBoard({ name: e.target.value }))}
                    />
                    <FormHelperText>You can change this any time</FormHelperText>
                  </FormControl>
                  <Box mt="1rem">
                    <Button backgroundColor="success" color="white" onClick={handleSave} isLoading={isSaving}>
                      <AiOutlineCheck /> &nbsp; Save
                    </Button>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <p>To delete your board, click the Delete button.</p>
                  <Box mt="1rem">
                    <Button
                      bg="red.500"
                      color="white"
                      onClick={handleDelete}
                      _hover={{ backgroundColor: 'red.600' }}
                      isLoading={isDeleting}
                      loadingText="Deleting">
                      <AiOutlineDelete /> &nbsp;Delete
                    </Button>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </>
  );
}
