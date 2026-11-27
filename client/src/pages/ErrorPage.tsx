import { Box, Button, Image, Text } from '@chakra-ui/react';

export default function ErrorPage({ message }: { message?: string }) {
  return (
    <>
      <Box display="flex" marginTop="100px">
        <Image height="250px" mx="auto" my="40px" src="/error/access_denied.svg" alt="error" />
      </Box>
      <Text textAlign="center" fontWeight="bold" fontSize={['15px', '15px', '25px', '25px']}>
        {message ?? 'Something bad happened!'}
      </Text>
      <Box textAlign="center" mt="4">
        {/* plain anchor: this page also renders outside the router (ErrorBoundary) */}
        <Button as="a" href="/">
          Go home
        </Button>
      </Box>
    </>
  );
}
