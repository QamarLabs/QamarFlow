import type { PropsWithChildren } from 'react';
import { Box, Button } from '@chakra-ui/react';
import { AiOutlineBuild, AiOutlineCreditCard, AiOutlineHome, AiOutlineSetting } from 'react-icons/ai';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Navbar from '@/widgets/navbar/Navbar';

const menu = [
  { path: '/home', label: 'Home', icon: AiOutlineHome },
  { path: '/boards', label: 'Boards', icon: AiOutlineCreditCard },
  { path: '/templates', label: 'Templates', icon: AiOutlineBuild },
  { path: '/settings', label: 'Settings', icon: AiOutlineSetting }
];

/** Navbar + left menu + content card used by the dashboard pages. */
export default function Sidebar({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar bg="white" />
      <Box display="flex" mt="2%">
        <Box height="80vh" width="20vw" boxShadow="base" rounded="lg" p="1em" ml="20px">
          <Box display="flex" flexDirection="column">
            {menu.map(item => (
              <Button
                key={item.path}
                as={RouterLink}
                to={item.path}
                mt="5px"
                mb="5px"
                height="4rem"
                borderRadius="1rem"
                boxShadow={pathname.startsWith(item.path) ? 'inner' : 'base'}
                justifyContent="left"
                colorScheme="gray"
                leftIcon={<item.icon size="20px" />}>
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>
        <Box minHeight="50vh" flexGrow={3} mx="2%" boxShadow="base" rounded="lg" bg="white" p="1rem">
          {children}
        </Box>
      </Box>
    </>
  );
}
