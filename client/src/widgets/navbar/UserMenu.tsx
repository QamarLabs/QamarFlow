import { Avatar, Box, Button, Flex, Image, Menu, MenuButton, MenuItem, MenuList, Spacer } from '@chakra-ui/react';
import { AiOutlineHome } from 'react-icons/ai';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth';

/** Top bar shown on a board page. */
export default function UserMenu() {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <Box boxShadow="sm" bgGradient="linear(darkblue, white)" display="flex" alignItems="center">
      <Flex direction="column">
        <Box>
          <Button as={RouterLink} to="/home" size="xs" ml="5px" my="5px" aria-label="Home">
            <AiOutlineHome />
          </Button>
          <Button as={RouterLink} to="/boards" size="xs" ml="5px" mr="10px" my="5px">
            Boards
          </Button>
        </Box>
        <Box m="10px">
          <Image height="30px" src="/qamarflow-logo.svg" display="inline-block" alt="QamarFlow" />
        </Box>
      </Flex>
      <Spacer />
      <Menu>
        <MenuButton mr="10px" aria-label="Account menu">
          <Avatar size="sm" name={user?.fullName || user?.email} src={user?.avatarUrl ?? undefined} />
        </MenuButton>
        <MenuList>
          <MenuItem as={RouterLink} to="/settings">
            Settings
          </MenuItem>
          <MenuItem
            onClick={async () => {
              await dispatch(logout());
              navigate('/');
            }}>
            Log out
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
}
