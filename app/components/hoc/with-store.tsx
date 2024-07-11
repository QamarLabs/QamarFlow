import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import createStore from '@/localredux/store';

const WithStore = App => {
  const AppWithStore = ({ ...props }) => {
    return (
      <Provider store={createStore()}>
        <App {...props} />
      </Provider>
    );
  };

  return AppWithStore;
};

export default WithStore;
