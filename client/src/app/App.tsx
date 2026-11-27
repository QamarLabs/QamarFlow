import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';
import ChakraProvider from './providers/ChakraProvider';
import StoreProvider from './providers/StoreProvider';
import ErrorBoundary from './ErrorBoundary';
import { router } from './router';
import './styles/default.css';

export default function App() {
  return (
    <StoreProvider>
      <ChakraProvider>
        <ErrorBoundary>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ErrorBoundary>
      </ChakraProvider>
    </StoreProvider>
  );
}
