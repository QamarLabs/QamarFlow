// app/template.tsx

import { withAuth } from '@/hooks/withAuth';
// import createStore from '@/localredux/store';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import WithAuthWrapper from './components/layout/WithAuthWrapper';
// import { Provider, useSelector } from 'react-redux';

export default async function Template({ children }: { children: React.ReactNode }) {
  // withAuth();
  // const reduxState = useSelector((state) => state); // Access the entire Redux state

  // useEffect(() => {
  //   if (!reduxState) {
  //     // Fetch initial Redux state or initialize as needed
  //     // Example: fetch initial state asynchronously
  //     const fetchInitialState = async () => {
  //       // Replace with your logic to fetch initial state
  //       const initialState = {}; // Example: initial state fetched from an API
  //       // Dispatch an action to initialize the state if necessary
  //       // Example: store.dispatch(initializeState(initialState));
  //     };

  //     fetchInitialState();
  //   }
  // }, [reduxState]);

  return <WithAuthWrapper>{children}</WithAuthWrapper>;
}
