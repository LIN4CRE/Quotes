import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { quotes } from '@/data/quotes';
import { pickRandom } from '@/lib/random';

/** /random redirects to a random quote detail page. */
export default function RandomQuote() {
  const [quoteId] = useState(() => pickRandom(quotes)?.id);

  return <Navigate to={quoteId ? `/quote/${quoteId}` : '/'} replace />;
}
