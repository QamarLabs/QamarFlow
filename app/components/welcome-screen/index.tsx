'use client';
import React from 'react';
import dynamic from 'next/dynamic';
const NavBar = dynamic(() => import('@/components/navbar'), { ssr: false });
import { Box, Image, Flex, Text } from '@chakra-ui/react';

const WelcomeScreen = () => {
  return (
    <>
      <Box bgGradient="linear(darkblue, white)" height="100vh">
        <NavBar />
        <Flex
          alignItems="center"
          flexDirection={['column', 'column', 'column', 'row', 'row']}
          justifyContent="center"
          p="4rem">
          <Box mb={['5', '2']} width={['100%', '100%', '80%', '60%', '50%']}>
            <Text
              fontSize={['32px', '34px', '40px', '42px', '50px']}
              fontWeight="bold"
              lineHeight="50px"
              mb={['2', '2', '3', '5', '5']}>
              QamarFlow propels teams to project success.
            </Text>
            <Text fontSize={['1rem', '1rem', '1.5rem', '1.5rem']}>
              Collaborate, manage projects, and reach new productivity peaks. From mission control
              to your home office, the way your team works is unique - accomplish it all with
              QamarFlow.
            </Text>
          </Box>
          <Box>
            <Image
              height={['200px', '300px', '400px', '500px', '600px']}
              p={['0', '100px']}
              src="/homepage/home-illustration.svg"
              alt="brand logo"></Image>
          </Box>
        </Flex>
      </Box>
    </>
  );
};

export default WelcomeScreen;
