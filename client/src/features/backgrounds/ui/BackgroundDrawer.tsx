import { useRef } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure
} from '@chakra-ui/react';
import { BsImages } from 'react-icons/bs';
import UnsplashPicker from './UnsplashPicker';

type Props = {
  selected?: string | null;
  onSelect: (url: string) => void;
  onSave: () => Promise<unknown>;
  isSaving?: boolean;
};

/** Drawer for picking a board background; saving is delegated to the caller. */
export default function BackgroundDrawer({ selected, onSelect, onSave, isSaving }: Props) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button size="xs" ml="2px" mr="10px" ref={btnRef} onClick={onOpen} aria-label="Change background">
        <BsImages />
      </Button>
      <Drawer size="sm" isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Choose background image</DrawerHeader>
          <DrawerBody>
            <UnsplashPicker selected={selected} onSelect={onSelect} />
          </DrawerBody>
          <DrawerFooter>
            <Button
              colorScheme="blue"
              onClick={async () => {
                await onSave();
                onClose();
              }}
              loadingText="Saving"
              isLoading={isSaving}>
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
