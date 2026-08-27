import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from './providers';
import { AppRouter } from './router';
import { logDev } from '../shared/lib/logger';
import { applyTheme, getInitialTheme } from '../shared/lib/theme';
import './styles.css';

logDev('[app] bootstrap');
applyTheme(getInitialTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <AppRouter />
    </Providers>
  </StrictMode>,
);
