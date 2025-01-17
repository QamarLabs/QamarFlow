import createStore from '@/localredux/store';
import { EnhancedStore } from '@reduxjs/toolkit';
let store;

export const setOrGetStore = (preloadedState = {}): EnhancedStore<any> => {
  let _store = store ?? createStore(preloadedState);

  if (preloadedState && store) {
    _store = createStore({ ...store.getState(), ...preloadedState });
    store = undefined;
  }

  // For SSG and SSR always create a new store
  if (typeof window === 'undefined') return _store;

  // Create the store once in the client
  if (!store) store = _store;

  return _store;
};
