'use client';
import { GetServerSidePropsContext, NextComponentType, NextPageContext } from 'next';
import { setOrGetStore } from '@/util/initialise-store';
import isValidUser from '@/util/is-valid-user';
import { updateUserData, fetchUser } from '@/localredux/user';

import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import { RootState } from '@/localredux/store';
import { redirect, usePathname, useRouter } from 'next/navigation';

interface AppProps {
  [key: string]: any;
}

const withAuth = () => {
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
  }, []);

  useEffect(() => {
    if (session && pathname === '/') router.push('/home');
  }, [session]);

  return {};
};

export { withAuth };
