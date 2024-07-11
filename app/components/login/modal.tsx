import React, { useState } from 'react';
import {
  Modal,
  ModalBody,
  ModalOverlay,
  ModalCloseButton,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Box
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { BsDiscord } from 'react-icons/bs';

interface LoginModalProps {
  setShowModal: (val: boolean) => void;
  showModal: boolean;
}

const LoginModal = ({ setShowModal, showModal }: LoginModalProps) => {
  const loginWithGoogle = async () => await signIn('google');
  const loginWithDiscord = async () => await signIn('discord');

  return (
    <>
      <Modal onClose={() => setShowModal(false)} isOpen={showModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button
              bg="white"
              color="black"
              mr={3}
              onClick={loginWithGoogle}
              loadingText="Logging in you in">
              <Box padding="2">
                <FcGoogle />
              </Box>
              Continue with Google
            </Button>
            <Button
              bg="#7289da"
              color="white"
              mr={3}
              onClick={loginWithDiscord}
              loadingText="Logging in you in">
              <Box padding="2">
                <BsDiscord />
              </Box>
              Continue with Discord
            </Button>
          </ModalBody>
          {/* <ModalFooter>
            <Button
              disabled={!validEmail.test(email)}
              colorScheme="blue"
              mr={3}
              onClick={handleClick}
              isLoading={isMailSending}
              loadingText="Sending">
              Invite
            </Button>
          </ModalFooter> */}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginModal;
