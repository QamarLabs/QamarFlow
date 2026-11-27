import { Text } from '@chakra-ui/react';
import Sidebar from '@/widgets/sidebar/Sidebar';
import Header from '@/widgets/header/Header';

export default function HomePage() {
  return (
    <Sidebar>
      <Header title="Home" />
      <Text as="h1">Visit the Boards page to create and manage your boards.</Text>
    </Sidebar>
  );
}
