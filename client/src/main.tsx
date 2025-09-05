import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import theme from './utils/theme.ts';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
