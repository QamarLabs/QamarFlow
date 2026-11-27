import { Box } from '@chakra-ui/react';
import { WelcomeScreen } from '@/features/auth';
import Navbar from '@/widgets/navbar/Navbar';
import Header from '@/widgets/header/Header';

export default function LandingPage() {
  return (
    <Box bgGradient="linear(darkblue, white)" minHeight="100vh">
      <Header />
      <Navbar />
      <WelcomeScreen />
    </Box>
  );
}
