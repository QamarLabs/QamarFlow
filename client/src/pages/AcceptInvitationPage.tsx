import { useEffect, useState } from 'react';
import { Box, Button, Center, Spinner, Text } from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { invitationsApi, type InvitationInfo } from '@/features/invitations';
import { errorMessage } from '@/shared/lib/errors';
import Navbar from '@/widgets/navbar/Navbar';
import Header from '@/widgets/header/Header';
import ErrorPage from './ErrorPage';

/** /invite/:token shows the invitation and lets a signed-in user accept it. */
export default function AcceptInvitationPage() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const authed = useAppSelector(s => !!s.auth.accessToken);
  const user = useAppSelector(s => s.auth.user);
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    invitationsApi.verify(token).then(setInfo, e => setError(errorMessage(e)));
  }, [token]);

  if (error && !info) return <ErrorPage message={`This invitation is not valid: ${error}`} />;
  if (!info)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  const here = encodeURIComponent(`/invite/${token}`);
  const email = encodeURIComponent(info.email);
  const wrongUser = !!user && user.email.toLowerCase() !== info.email.toLowerCase();
  const boardLabel = info.boardName ? ` to "${info.boardName}"` : '';

  const accept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await invitationsApi.accept(token);
      navigate(`/boards/${res?.boardId ?? info.boardId}`, { replace: true });
    } catch (e) {
      setError(errorMessage(e));
      setAccepting(false);
    }
  };

  return (
    <>
      <Header title="Invitation" />
      <Navbar bg="white" />
      <Box maxW="md" mx="auto" mt="10" p="6" boxShadow="base" rounded="lg" textAlign="center">
        <Text fontSize="xl" fontWeight="bold" mb="2">
          You are invited{boardLabel}
        </Text>
        {info.inviterName && <Text mb="2">Invited by {info.inviterName}</Text>}
        <Text mb="6" color="gray.600">
          This invitation is for {info.email}
        </Text>
        {!authed ? (
          <>
            <Button as={RouterLink} to={`/login?next=${here}&email=${email}`} colorScheme="purple" mr="3">
              Log in to accept
            </Button>
            <Button as={RouterLink} to={`/register?next=${here}&email=${email}`}>
              Create an account
            </Button>
          </>
        ) : wrongUser ? (
          <Text color="red.500">
            You are signed in as {user?.email}. Log out and sign in as {info.email} to accept.
          </Text>
        ) : (
          <Button colorScheme="green" onClick={accept} isLoading={accepting} loadingText="Joining">
            Accept invitation
          </Button>
        )}
        {error && (
          <Text color="red.500" mt="4">
            {error}
          </Text>
        )}
      </Box>
    </>
  );
}
