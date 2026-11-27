import { useEffect, type PropsWithChildren } from 'react';
import { Center, Spinner } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { restoreSession } from '../model/auth.slice';

/** Tries the refresh cookie once on boot so a reload keeps the user signed in. */
export default function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const bootstrap = useAppSelector(s => s.auth.bootstrap);

  useEffect(() => {
    if (bootstrap === 'idle') dispatch(restoreSession());
  }, [bootstrap, dispatch]);

  if (bootstrap !== 'ready') {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand" />
      </Center>
    );
  }
  return <>{children}</>;
}
