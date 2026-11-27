import { Box, Image, Text } from '@chakra-ui/react';

export default function Templates() {
  return (
    <>
      <Box display="flex">
        <Image height="250px" mx="auto" my="40px" src="/under-construction.svg" alt="Under construction" />
      </Box>
      <Text textAlign="center" fontWeight="bold" fontSize="25px">
        Under construction...
      </Text>
    </>
  );
}
