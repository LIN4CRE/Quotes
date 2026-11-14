import { Download, ImageIcon, Loader2, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { downloadBlob } from '@/lib/download';
import { imageFilename, imageFormats, renderQuoteImage, type ImageFormat } from '@/lib/quoteImage';
import { buildQuoteText, canShareFiles } from '@/lib/share';
import { useToast } from '@/providers/ToastProvider';
import { cn } from '@/lib/cn';
import type { Quote } from '@/types';

interface QuoteImageDialogProps {
  open: boolean;
  onClose: () => void;
  quote: Quote;
}

type Status = 'loading' | 'ready' | 'error';

export function QuoteImageDialog({ open, onClose, quote }: QuoteImageDialogProps) {
  const [format, setFormat] = useState<ImageFormat>('portrait');
  const { addToast } = useToast();

  const renderKey = `${quote.id}:${format}:${open}`;
  const [renderState, setRenderState] = useState<{
    key: string;
    status: Status;
    preview: { url: string; blob: Blob } | null;
    error: string;
  }>({ key: renderKey, status: 'loading', preview: null, error: '' });

  // A new quote, format or open state starts from a clean slate. Resetting
  // during render avoids an extra paint with stale pixels.
  if (renderState.key !== renderKey) {
    setRenderState({ key: renderKey, status: 'loading', preview: null, error: '' });
  }

  const current =
    renderState.key === renderKey
      ? renderState
      : { status: 'loading' as Status, preview: null, error: '' };
  const { status, preview, error } = current;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    renderQuoteImage(quote, format)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setRenderState({
          key: renderKey,
          status: 'ready',
          preview: { url: objectUrl, blob },
          error: '',
        });
      })
      .catch((reason: unknown) => {
        if (cancelled) return;
        setRenderState({
          key: renderKey,
          status: 'error',
          preview: null,
          error:
            reason instanceof Error
              ? reason.message
              : 'The image could not be created in this browser.',
        });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, format, quote, renderKey]);

  const handleDownload = () => {
    if (!preview) return;
    downloadBlob(preview.blob, imageFilename(quote, format));
    addToast({
      title: 'Image downloaded',
      description: `${imageFormats[format].label} PNG saved.`,
      variant: 'success',
    });
  };

  const handleShare = async () => {
    if (!preview) return;
    const filename = imageFilename(quote, format);
    const file = new File([preview.blob], filename, { type: 'image/png' });

    if (canShareFiles() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'LIN4CRE QUOTES',
          text: buildQuoteText(quote),
        });
        return;
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
      }
    }

    handleDownload();
    addToast({
      title: 'Image sharing is not available here',
      description: 'The image was downloaded instead.',
      variant: 'info',
    });
  };

  const definition = imageFormats[format];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a quote image"
      description="Drawn in your browser at a social-friendly size. Nothing is uploaded."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
            disabled={!preview || status !== 'ready'}
          >
            <Share2 className="size-4" aria-hidden />
            Share image
          </Button>
          <Button onClick={handleDownload} disabled={!preview || status !== 'ready'}>
            <Download className="size-4" aria-hidden />
            Download PNG
          </Button>
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0">
          <div
            className="relative overflow-hidden rounded-2xl border border-line bg-surface-2"
            style={{ aspectRatio: `${definition.width} / ${definition.height}` }}
          >
            {status === 'loading' ? (
              <div className="absolute inset-0 grid place-items-center">
                <Skeleton className="absolute inset-0 rounded-none" />
                <span className="relative flex items-center gap-2 text-xs text-muted">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Rendering image…
                </span>
              </div>
            ) : null}

            {status === 'error' ? (
              <div className="absolute inset-0 grid place-items-center p-6 text-center">
                <div>
                  <ImageIcon className="mx-auto size-6 text-subtle" aria-hidden />
                  <p className="mt-3 text-sm font-medium text-ink">Image unavailable</p>
                  <p className="mt-1 text-xs text-muted">{error}</p>
                </div>
              </div>
            ) : null}

            {preview && status === 'ready' ? (
              <img
                src={preview.url}
                alt={`Quote image preview: “${quote.text}” by ${quote.author}`}
                className="h-full w-full object-contain motion-safe:animate-fade-in"
                width={definition.width}
                height={definition.height}
              />
            ) : null}
          </div>
        </div>

        <fieldset className="min-w-0">
          <legend className="label-caps">Format</legend>
          <div className="mt-2 space-y-2">
            {Object.values(imageFormats).map((option) => (
              <label
                key={option.id}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition',
                  format === option.id
                    ? 'border-accent/40 bg-accent-soft'
                    : 'border-line bg-surface-2 hover:border-line-strong',
                )}
              >
                <input
                  type="radio"
                  name="image-format"
                  value={option.id}
                  checked={format === option.id}
                  onChange={() => setFormat(option.id)}
                  className="mt-1 accent-[var(--c-accent)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{option.label}</span>
                  <span className="block text-[11px] leading-snug text-subtle">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>

          <p className="mt-4 text-[11px] leading-relaxed text-subtle">
            The generated image includes the author, the source where known, the attribution status
            and the LIN4CRE mark.
          </p>
        </fieldset>
      </div>
    </Modal>
  );
}
