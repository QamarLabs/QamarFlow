import React from 'react';
import { Box } from '@chakra-ui/react';
import { withAuth } from '@/hooks/withAuth';
import SidebarWrapper from '../layout/SidebarWrapper';

const Home = (): JSX.Element => {
  return (
    <SidebarWrapper page="home">
      <Box minHeight="50vh" flexGrow={3} mx="2%" boxShadow="base" rounded="lg" bg="white" p="1rem">
        <h1>You can visit the boards page to see the qamarflow-clone functionality.</h1>
      </Box>
    </SidebarWrapper>
  );
};

export default Home;
