'use client';
import { GetServerSidePropsContext, NextComponentType, NextPageContext } from 'next';
import { setOrGetStore } from '@/util/initialise-store';
import isValidUser from '@/util/is-valid-user';
import { updateUserData, fetchUser } from '@/localredux/user';

import { useDispatch, useSelector } from 'react-redux';
import { useLayoutEffect } from 'react';
import { useSession } from 'next-auth/react';
import { RootState } from '@/localredux/store';

interface AppProps {
  [key: string]: any;
}

const WithAuth = (App: NextComponentType<NextPageContext, any, AppProps>, appProps: AppProps) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { isValid, id } = useSelector((store: RootState) => store.user);

  useLayoutEffect(() => {
    if (session && session.user && (!isValid || !id)) {
      dispatch(updateUserData({ type: 'isValid', value: true }));
      dispatch(updateUserData({ type: 'id', value: (session.user as any)['_id'] }));
    }
  }, []);

  return <App {...appProps} session={session} />;
};

export { WithAuth };
