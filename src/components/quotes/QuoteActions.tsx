import { Copy, FolderPlus, Heart, Image as ImageIcon, Share2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { IconButton } from '@/components/ui/Button';
import { QuoteImageDialog } from '@/components/share/QuoteImageDialog';
import { CollectionPicker } from '@/components/library/CollectionPicker';
import { useLibrary } from '@/providers/LibraryProvider';
import { useToast } from '@/providers/ToastProvider';
import { buildQuoteText, copyText, shareQuote } from '@/lib/share';
import { cn } from '@/lib/cn';
import type { Quote } from '@/types';

interface QuoteActionsProps {
  quote: Quote;
  className?: string;
  extra?: ReactNode;
  showImage?: boolean;
  size?: 'sm' | 'md';
}

export function QuoteActions({
  quote,
  className,
  extra,
  showImage = true,
  size = 'sm',
}: QuoteActionsProps) {
  const { isFavourite, toggleFavourite } = useLibrary();
  const { addToast } = useToast();
  const [imageOpen, setImageOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const favourite = isFavourite(quote.id);

  const handleFavourite = () => {
    const added = toggleFavourite(quote.id);
    addToast({
      title: added ? 'Saved to favourites' : 'Removed from favourites',
      description: added ? quote.author : undefined,
      variant: 'success',
    });
  };

  const handleCopy = async () => {
    const copied = await copyText(buildQuoteText(quote));
    addToast({
      title: copied ? 'Quote copied' : 'Could not copy',
      description: copied
        ? 'Text copied with author attribution.'
        : 'Your browser blocked clipboard access.',
      variant: copied ? 'success' : 'error',
    });
  };

  const handleShare = async () => {
    const result = await shareQuote(quote);
    if (result === 'shared') return;
    if (result === 'cancelled') return;

    addToast(
      result === 'copied'
        ? {
            title: 'Quote copied',
            description: 'Sharing is not available here, so the text was copied instead.',
            variant: 'success',
          }
        : {
            title: 'Could not share',
            description: 'Copy the quote from the quote page instead.',
            variant: 'error',
          },
    );
  };

  return (
    <>
      <div className={cn('flex items-center gap-0.5', className)}>
        <IconButton
          label={favourite ? 'Remove from favourites' : 'Save to favourites'}
          size={size}
          onClick={handleFavourite}
          aria-pressed={favourite}
          className={favourite ? 'text-accent' : undefined}
        >
          <Heart className={cn('size-4', favourite && 'fill-current')} aria-hidden />
        </IconButton>
        <IconButton label="Copy quote with attribution" size={size} onClick={handleCopy}>
          <Copy className="size-4" aria-hidden />
        </IconButton>
        <IconButton label="Share quote" size={size} onClick={handleShare}>
          <Share2 className="size-4" aria-hidden />
        </IconButton>
        {showImage ? (
          <IconButton label="Create a quote image" size={size} onClick={() => setImageOpen(true)}>
            <ImageIcon className="size-4" aria-hidden />
          </IconButton>
        ) : null}
        <IconButton label="Add to collection" size={size} onClick={() => setCollectionsOpen(true)}>
          <FolderPlus className="size-4" aria-hidden />
        </IconButton>
        {extra}
      </div>

      <QuoteImageDialog open={imageOpen} onClose={() => setImageOpen(false)} quote={quote} />
      <CollectionPicker
        open={collectionsOpen}
        onClose={() => setCollectionsOpen(false)}
        quoteId={quote.id}
      />
    </>
  );
}
