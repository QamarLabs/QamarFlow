'use client';
import { Box, Heading, Avatar, Tooltip } from '@chakra-ui/react';
import BoardSettings from '@/components/sub-navbar/board-settings';
import InviteModal from '@/components/sub-navbar/invite-user/modal';
import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/index';
import { fetchUsers } from '@/localredux/users';

import UnsplashDrawer from '@/components/sub-navbar/unsplash-in-drawer';

const SubNavbar = () => {
  const board = useAppSelector(state => state.board.board);
  const users = useAppSelector(state => state.users.users);

  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchMyAPI() {
      await dispatch(fetchUsers());
    }
    fetchMyAPI();
  }, []);

  const loadBoardUsers = () => {
    return users.map((user: any, index) => (
      <Tooltip label={user.fullName} aria-label="A tooltip" key={index}>
        <Avatar size="sm" name={user.fullName} mr="5px" src="https://bit.ly/tioluwani-kolawole" />
      </Tooltip>
    ));
  };

  return (
    <Box
      height="40px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      bg="rgba(0,0,0,0.1)">
      <Heading ml="0.5rem" color="white" as="h4" size="sm" whiteSpace="nowrap" display="block">
        {board?.name}
      </Heading>
      <Box>{loadBoardUsers()}</Box>
      <Box>
        <InviteModal />
        <BoardSettings />
        <UnsplashDrawer />
      </Box>
    </Box>
  );
};

export default SubNavbar;
