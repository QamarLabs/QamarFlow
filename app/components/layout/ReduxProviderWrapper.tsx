'use client';
import createStore from '@/localredux/store';
import { Provider } from 'react-redux';

export default function ReduxProviderWrapper({ children }: React.PropsWithChildren) {
  return <Provider store={createStore()}>{children}</Provider>;
}
