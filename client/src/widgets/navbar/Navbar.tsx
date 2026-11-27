import { Box, Button, Flex, Image, Spacer } from '@chakra-ui/react';
import { GrLogout } from 'react-icons/gr';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth';

export default function Navbar({ bg }: { bg?: string }) {
  const token = useAppSelector(s => s.auth.accessToken);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <Box bg={bg} boxShadow="md">
      <Flex alignItems="center">
        <RouterLink to={token ? '/home' : '/'}>
          <Image height="12" src="/qamarflow-logo.svg" alt="QamarFlow" m="5" />
        </RouterLink>
        <Spacer />
        {token ? (
          <Button fontSize="20" color="danger" variant="link" mr="5" onClick={handleLogout} aria-label="Log out">
            <GrLogout />
          </Button>
        ) : (
          <>
            <Button as={RouterLink} to="/login" fontSize="20" color="brand" variant="link" mr="5">
              Log in
            </Button>
            <Button as={RouterLink} to="/register" colorScheme="purple" mr="5">
              Sign up
            </Button>
          </>
        )}
      </Flex>
    </Box>
  );
}
