import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { LibraryProvider } from '@/providers/LibraryProvider';
import { SettingsProvider } from '@/providers/SettingsProvider';
import { ToastProvider } from '@/providers/ToastProvider';

export function TestProviders({ children, route = '/' }: { children: ReactNode; route?: string }) {
  return (
    <MemoryRouter initialEntries={[route]}>
      <SettingsProvider>
        <ToastProvider>
          <LibraryProvider>{children}</LibraryProvider>
        </ToastProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

export function renderWithProviders(ui: ReactElement, route = '/'): RenderResult {
  return render(<TestProviders route={route}>{ui}</TestProviders>);
}

/** Renders a page at a real route so useParams and Links work. */
export function renderRoute(path: string, element: ReactElement, route: string): RenderResult {
  return render(
    <TestProviders route={route}>
      <Routes>
        <Route path={path} element={element} />
      </Routes>
    </TestProviders>,
  );
}
