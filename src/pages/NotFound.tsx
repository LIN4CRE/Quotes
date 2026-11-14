import { ArrowLeft, Compass, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { QuoteActions } from '@/components/quotes/QuoteActions';
import { Button, LinkButton } from '@/components/ui/Button';
import { quotes } from '@/data/quotes';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pickRandom } from '@/lib/random';

export default function NotFound() {
  useDocumentTitle('Page not found');
  const [quote] = useState(() => pickRandom(quotes));
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl animate-rise py-10 text-center sm:py-16">
      <p className="text-[11px] font-semibold tracking-[0.3em] text-accent uppercase">404</p>
      <h1 className="display-title mt-3 text-4xl text-ink sm:text-5xl">
        This page is not in the library
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        The address may be mistyped, or the page may have moved. Here is a quote instead.
      </p>

      {quote ? (
        <div className="mt-8 rounded-3xl border border-line bg-surface p-6 text-left sm:p-8">
          <p className="quote-body text-[1.4rem] text-ink sm:text-[1.6rem]">“{quote.text}”</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-[12px] text-muted">— {quote.author}</p>
            <QuoteActions quote={quote} showImage={false} />
          </div>
        </div>
      ) : null}

      <div className="mt-7 flex flex-wrap justify-center gap-2">
        <LinkButton to="/">
          <ArrowLeft className="size-4" aria-hidden />
          Back to Discover
        </LinkButton>
        <Button
          variant="secondary"
          onClick={() => {
            const next = pickRandom(quotes, (item) => item.id === quote?.id);
            if (next) navigate(`/quote/${next.id}`);
          }}
        >
          <Shuffle className="size-4" aria-hidden />
          Another quote
        </Button>
        <Link
          to="/explore"
          className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm text-muted transition hover:text-ink"
        >
          <Compass className="size-4" aria-hidden />
          Explore themes
        </Link>
      </div>
    </div>
  );
}
