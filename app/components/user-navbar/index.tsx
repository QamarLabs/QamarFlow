import React, { FC } from 'react';
import {
  Button,
  Box,
  Spacer,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
  Image,
  Text,
  Flex
} from '@chakra-ui/react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { useAppSelector } from '@/hooks/index';
import { AiOutlineHome } from 'react-icons/ai';
import { signOut, useSession } from 'next-auth/react';

const UserNavBar = () => {
  const { data: session } = useSession();
  const user = useAppSelector(state => state.user);
  const logoutUser = async () => await signOut();

  const renderButtons = () => {
    if (session && session?.user) {
      return (
        <>
          <Menu>
            <MenuButton mr="5px">
              <Avatar
                size="sm"
                name={user?.fullName}
                color="white"
                src={session.user.image ?? ''}
              />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={logoutUser}>Log out</MenuItem>
            </MenuList>
          </Menu>
        </>
      );
    }

    return (
      <>
        <Button fontSize="20" color="brand" variant="link" float="right" mr="2" pr="2">
          <Link href="/login">Log in</Link>
        </Button>
      </>
    );
  };

  return (
    <Box boxShadow="sm" bgGradient="linear(darkblue, white)" display="flex">
      <Flex direction="column">
        <Box>
          <Link href="/home">
            <Button size="xs" ml="5px" my="5px">
              <AiOutlineHome />
            </Button>
          </Link>
          <Link href="/boards">
            <Button size="xs" ml="5px" mr="10px" my="5px">
              Boards
            </Button>
          </Link>
        </Box>
        <Box m="10px" color="white">
          <Image height="30px" src="/qamarflow-logo.svg" display="inline-block" alt="brand logo" />
        </Box>
      </Flex>
      <Spacer />
      {renderButtons()}
    </Box>
  );
};

export default UserNavBar;
