import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { saveBoard } from '@/localredux/board';

import PropType from 'prop-types';
import React from 'react';
import { BsImages } from 'react-icons/bs';
import Unsplash from '@/components/sub-navbar/unsplash-in-drawer/unsplash';
import { useAppDispatch, useAppSelector } from '@/hooks/index';

const SubNavbar = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const board = useAppSelector(state => state.board);

  const dispatch = useAppDispatch();

  const btnRef = React.useRef<any>();

  const handleSave = async () => {
    await dispatch(saveBoard());
    onClose();
  };

  return (
    <>
      <Button size="xs" ml="2px" mr="10px" ref={btnRef} onClick={onOpen}>
        <BsImages />
      </Button>
      <Drawer size="sm" isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Choose background image</DrawerHeader>
          <DrawerBody>
            <Unsplash />
          </DrawerBody>
          <DrawerFooter>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              loadingText="Saving"
              isLoading={board.isLoading}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

SubNavbar.propTypes = {
  board: PropType.object
};

export default SubNavbar;
