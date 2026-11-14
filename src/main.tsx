import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import { LibraryProvider } from './providers/LibraryProvider';
import { applyPreferences, loadSettings, SettingsProvider } from './providers/SettingsProvider';
import { ToastProvider } from './providers/ToastProvider';

// Apply the stored theme before the first paint to avoid a flash of the wrong theme.
applyPreferences(loadSettings());

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ToastProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </ToastProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>,
);
