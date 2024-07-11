import React from 'react';
import { Box, Image, Text } from '@chakra-ui/react';
import { withAuth } from '@/hooks/withAuth';
import SidebarWrapper from '../layout/SidebarWrapper';

const Templates = (): JSX.Element => {
  return (
    <SidebarWrapper page="templates">
      <Box minHeight="50vh" flexGrow={3} mx="2%" boxShadow="base" rounded="lg" bg="white" p="1rem">
        <Box display="flex">
          <Image
            height="250px"
            ml="auto"
            mr="auto"
            my="40px"
            src="/under-construction.svg"
            display="inline-block"
            alt="brand logo"
          />
        </Box>
        <Text textAlign="center" fontWeight="bold" fontSize="25px">
          Under construction...
        </Text>
      </Box>
    </SidebarWrapper>
  );
};

export default Templates;
