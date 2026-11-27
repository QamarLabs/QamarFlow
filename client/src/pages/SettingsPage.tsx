import { Box, Image, Text } from '@chakra-ui/react';
import { useAppSelector } from '@/app/hooks';
import Sidebar from '@/widgets/sidebar/Sidebar';
import Header from '@/widgets/header/Header';

export default function SettingsPage() {
  const user = useAppSelector(s => s.auth.user);
  return (
    <Sidebar>
      <Header title="Settings" />
      {user && (
        <Text mb="4">
          Signed in as <b>{user.fullName || user.email}</b> ({user.email})
        </Text>
      )}
      <Box display="flex">
        <Image height="250px" mx="auto" my="40px" src="/under-construction.svg" alt="Under construction" />
      </Box>
      <Text textAlign="center" fontWeight="bold" fontSize="25px">
        Under construction...
      </Text>
    </Sidebar>
  );
}
