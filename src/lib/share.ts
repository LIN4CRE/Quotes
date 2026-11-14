import type { Quote, ShareOutcome } from '@/types';

export interface QuoteTextOptions {
  includeAttribution?: boolean;
  includeSource?: boolean;
}

/**
 * Builds shareable text. Attribution is never silently upgraded: disputed and
 * merely-attributed quotes are labelled in shared text as well as in the app.
 */
export function buildQuoteText(quote: Quote, options: QuoteTextOptions = {}): string {
  const { includeAttribution = true, includeSource = true } = options;
  let text = `“${quote.text}”`;

  if (!includeAttribution) return text;

  let attribution = `— ${quote.author}`;

  if (includeSource && quote.source) {
    attribution += `, ${quote.source}`;
    if (quote.sourceUrl) attribution += `\n${quote.sourceUrl}`;
  }

  if (quote.attribution === 'disputed') {
    attribution += ' (disputed attribution)';
  } else if (quote.attribution === 'attributed') {
    attribution += ' (widely attributed)';
  } else if (quote.attribution === 'anonymous') {
    attribution = includeSource && quote.source ? `— Proverb, ${quote.source}` : '— Proverb';
  }

  text += `\n\n${attribution}`;
  return text;
}

/** Copies text using the async Clipboard API with a legacy fallback. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or insecure context: try the fallback below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Shares via the Web Share API, falling back to copying. Returns which path
 * actually happened so the UI can report it honestly.
 */
export async function shareQuote(quote: Quote): Promise<ShareOutcome> {
  const text = buildQuoteText(quote);

  if (canUseWebShare()) {
    try {
      await navigator.share({ title: 'LIN4CRE QUOTES', text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Some browsers reject share for unsupported payloads: fall back to copy.
    }
  }

  const copied = await copyText(text);
  return copied ? 'copied' : 'failed';
}

export function canShareFiles(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
  );
}
