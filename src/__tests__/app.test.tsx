import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as axe from 'axe-core';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '@/App';
import Discover from '@/pages/Discover';
import { renderWithProviders } from '@/test/render';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.dataset.theme = 'dark';
});

describe('application startup and routing', () => {
  it('renders the Discover page on startup', async () => {
    renderWithProviders(<App />);

    expect(
      await screen.findByRole('heading', { name: /Find a line that stays with you/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Quote of the day')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });

  it('navigates between sections with client-side routing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);

    await screen.findByRole('heading', { name: /Find a line that stays with you/i });

    const sidebar = screen.getByRole('navigation', { name: 'Main navigation' });
    await user.click(within(sidebar).getByRole('link', { name: /Favourites/i }));

    expect(
      await screen.findByRole('heading', { name: 'Favourites', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders a useful 404 page for unknown routes', async () => {
    renderWithProviders(<App />, '/definitely-not-a-page');

    expect(
      await screen.findByRole('heading', { name: 'This page is not in the library' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Discover/i })).toHaveAttribute('href', '/');
  });
});

describe('keyboard shortcuts', () => {
  it('opens the shortcut guide with ? and closes with Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await screen.findByRole('heading', { name: /Find a line that stays with you/i });

    await user.keyboard('?');
    expect(await screen.findByRole('dialog', { name: 'Keyboard shortcuts' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await screen.findByRole('heading', { name: /Find a line that stays with you/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the command palette with Ctrl+K and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    await screen.findByRole('heading', { name: /Find a line that stays with you/i });

    await user.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog', { name: 'Search everything' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search the library')).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('accessibility', () => {
  it('has no detectable axe violations on Discover', async () => {
    renderWithProviders(<Discover />);

    const results = await axe.run(document.body, {
      rules: {
        'color-contrast': { enabled: false },
        region: { enabled: false },
        'landmark-one-main': { enabled: false },
        'page-has-heading-one': { enabled: false },
      },
    });

    const summary = results.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.html),
    }));

    expect(summary).toEqual([]);
  });

  it('renders labelled navigation, a skip link and one main landmark', async () => {
    renderWithProviders(<App />);
    await screen.findByRole('heading', { name: /Find a line that stays with you/i });

    expect(screen.getByRole('link', { name: /Skip to content/i })).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();
  });
});
