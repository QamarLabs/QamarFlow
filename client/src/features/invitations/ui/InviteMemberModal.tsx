import { useState, type FormEvent } from 'react';
import {
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
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { errorMessage } from '@/shared/lib/errors';
import { invitationsApi } from '../api/invitations.api';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function InviteMemberModal({ boardId }: { boardId: string }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = EMAIL.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    setError(null);
    try {
      await invitationsApi.create(boardId, email.trim());
      toast({ status: 'success', title: `Invitation sent to ${email}` });
      setEmail('');
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen} size="xs" ml="5px">
        Invite
      </Button>
      <Modal onClose={onClose} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent as="form" onSubmit={handleSubmit}>
          <ModalHeader>Invite User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter their email"
              autoFocus
            />
            {error && (
              <Text color="red.500" mt="2" fontSize="sm">
                {error}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button type="submit" isDisabled={!valid} colorScheme="blue" isLoading={sending} loadingText="Sending">
              Invite
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
