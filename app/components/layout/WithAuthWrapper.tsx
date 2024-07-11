'use client';

import { RootState } from '@/localredux/store';
import { updateUserData } from '@/localredux/user';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface WithAuthWrapperProps {}

function WithAuthWrapper({ children }: React.PropsWithChildren<WithAuthWrapperProps>) {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const isValid = useSelector((store: RootState) => store.user.isValid);
  const id = useSelector((store: RootState) => store.user.id);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (session && session.user && (!isValid || !id)) {
      dispatch(updateUserData({ type: 'isValid', value: true }));
      dispatch(updateUserData({ type: 'id', value: (session.user as any)['_id'] }));
    }

    if (!session) router.push('/');
  }, [router]);

  useEffect(() => {
    if (session && pathname === '/') router.push('/home');
  }, [session]);

  return <>{children}</>;
}

export default WithAuthWrapper;
