import { useEffect } from 'react';

const BASE_TITLE = 'LIN4CRE QUOTES';

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    if (!title) {
      document.title = `${BASE_TITLE} — Discover, collect and share quotes`;
      return;
    }
    document.title = `${title} — ${BASE_TITLE}`;
  }, [title]);
}
