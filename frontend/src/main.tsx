import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      throwOnError: (error: any) => {
        // Surface 404, 500 and other HTTP error responses directly to ErrorBoundary
        return Boolean(error?.statusCode && error.statusCode >= 400);
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Application Error Boundary">
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ErrorBoundary>
);
