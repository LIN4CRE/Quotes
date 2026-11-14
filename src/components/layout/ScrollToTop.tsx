import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Resets scroll on navigation without hijacking scroll on the same page. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
