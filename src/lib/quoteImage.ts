import { getCategory } from '@/data/categories';
import { toneStyles } from '@/lib/tones';
import type { Quote } from '@/types';

export type ImageFormat = 'portrait' | 'square' | 'wide';

export interface ImageFormatDefinition {
  id: ImageFormat;
  width: number;
  height: number;
  label: string;
  description: string;
}

export const imageFormats: Record<ImageFormat, ImageFormatDefinition> = {
  portrait: {
    id: 'portrait',
    width: 1080,
    height: 1350,
    label: 'Portrait',
    description: '1080 × 1350 · Instagram, Pinterest',
  },
  square: {
    id: 'square',
    width: 1080,
    height: 1080,
    label: 'Square',
    description: '1080 × 1080 · feed posts',
  },
  wide: {
    id: 'wide',
    width: 1200,
    height: 630,
    label: 'Wide',
    description: '1200 × 630 · link previews, X',
  },
};

export function imageFilename(quote: Quote, format: ImageFormat): string {
  const slug = quote.id.replace(/[^a-z0-9-]/gi, '').slice(0, 60) || 'quote';
  return `lin4cre-quotes-${slug}-${format}.png`;
}

interface Palette {
  background: string;
  accent: string;
  deep: string;
}

function paletteFor(quote: Quote): Palette {
  const firstCategory = quote.categories[0];
  const tone = firstCategory ? getCategory(firstCategory)?.tone : undefined;
  const colours = tone ? toneStyles[tone].canvas : toneStyles.gold.canvas;

  return {
    accent: colours[0],
    deep: colours[1],
    background: '#0a0a0d',
  };
}

async function ensureFonts(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;

  try {
    await Promise.all([
      document.fonts.load('600 64px "Fraunces Variable"'),
      document.fonts.load('500 34px "Inter Variable"'),
    ]);
    await document.fonts.ready;
  } catch {
    // Font loading is best-effort; system fallbacks are used otherwise.
  }
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function drawLetterSpacedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
): void {
  let cursor = x;
  for (const character of text) {
    context.fillText(character, cursor, y);
    cursor += context.measureText(character).width + spacing;
  }
}

function attributionLabel(quote: Quote): string | null {
  switch (quote.attribution) {
    case 'verified':
      return null;
    case 'attributed':
      return 'Widely attributed';
    case 'disputed':
      return 'Disputed attribution — see source note';
    case 'anonymous':
      return 'Traditional proverb';
    default:
      return null;
  }
}

/**
 * Renders a shareable quote card at a social-friendly size. Text is drawn on a
 * canvas locally; nothing is uploaded anywhere.
 */
export async function renderQuoteImage(quote: Quote, format: ImageFormat): Promise<Blob> {
  if (typeof document === 'undefined') {
    throw new Error('Image generation needs a browser canvas.');
  }

  await ensureFonts();

  const definition = imageFormats[format];
  const canvas = document.createElement('canvas');
  canvas.width = definition.width;
  canvas.height = definition.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create the image.');

  const palette = paletteFor(quote);
  const isWide = format === 'wide';
  const padding = Math.round(definition.width * (isWide ? 0.075 : 0.095));
  const maxTextWidth = definition.width - padding * 2;

  const textLength = quote.text.length;
  const baseSize = isWide ? 52 : format === 'square' ? 60 : 68;
  const scale = textLength > 280 ? 0.62 : textLength > 190 ? 0.74 : textLength > 120 ? 0.86 : 1;
  const quoteSize = Math.round(baseSize * scale);
  const lineHeight = Math.round(quoteSize * 1.3);

  // Background wash
  const background = context.createLinearGradient(0, 0, definition.width, definition.height);
  background.addColorStop(0, palette.background);
  background.addColorStop(0.62, palette.deep);
  background.addColorStop(1, '#08090b');
  context.fillStyle = background;
  context.fillRect(0, 0, definition.width, definition.height);

  // Accent glows
  const glow = context.createRadialGradient(
    definition.width * 0.16,
    definition.height * 0.12,
    0,
    definition.width * 0.16,
    definition.height * 0.12,
    definition.width * 0.75,
  );
  glow.addColorStop(0, `${palette.accent}55`);
  glow.addColorStop(0.5, `${palette.accent}12`);
  glow.addColorStop(1, 'transparent');
  context.fillStyle = glow;
  context.fillRect(0, 0, definition.width, definition.height);

  context.save();
  context.globalAlpha = 0.08;
  context.strokeStyle = '#ffffff';
  context.lineWidth = 1;
  for (let x = 0; x < definition.width; x += 48) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, definition.height);
    context.stroke();
  }
  context.restore();

  // Oversized opening quotation mark
  context.save();
  context.fillStyle = palette.accent;
  context.globalAlpha = 0.22;
  context.font = `700 ${Math.round(quoteSize * 2.8)}px "Fraunces Variable", Georgia, serif`;
  context.textBaseline = 'top';
  context.fillText('“', padding - 8, padding - quoteSize * 0.9);
  context.restore();

  context.textBaseline = 'alphabetic';
  context.fillStyle = '#f7f3ea';
  context.font = `600 ${quoteSize}px "Fraunces Variable", Georgia, serif`;

  const lines = wrapLines(context, `“${quote.text}”`, maxTextWidth);
  const maxLines = format === 'wide' ? 5 : 8;
  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    const last = visibleLines[maxLines - 1] ?? '';
    visibleLines[maxLines - 1] = `${last.replace(/[.,;:]?$/, '')}…`;
  }

  const authorSize = Math.round(quoteSize * 0.37);
  const sourceSize = Math.round(quoteSize * 0.3);
  const blockHeight =
    visibleLines.length * lineHeight + authorSize + (quote.source ? sourceSize + 18 : 0) + 46;
  let cursorY = Math.max(
    padding + quoteSize * 1.8,
    (definition.height - blockHeight) / 2 - (isWide ? 10 : 40),
  );

  for (const line of visibleLines) {
    context.fillText(line, padding, cursorY);
    cursorY += lineHeight;
  }

  cursorY += authorSize + 12;
  context.fillStyle = palette.accent;
  context.font = `500 ${authorSize}px "Inter Variable", system-ui, sans-serif`;
  context.fillText(`— ${quote.author}`, padding, cursorY);

  if (quote.source) {
    cursorY += sourceSize + 18;
    context.fillStyle = 'rgba(247, 243, 234, 0.62)';
    context.font = `400 ${sourceSize}px "Inter Variable", system-ui, sans-serif`;
    const sourceLine = wrapLines(context, quote.source, maxTextWidth)[0] ?? '';
    context.fillText(sourceLine, padding, cursorY);
  }

  const label = attributionLabel(quote);
  if (label) {
    context.fillStyle = 'rgba(247, 243, 234, 0.5)';
    context.font = `400 ${Math.round(sourceSize * 0.78)}px "Inter Variable", system-ui, sans-serif`;
    context.fillText(label, padding, definition.height - padding - 54);
  }

  // Footer
  const footerY = definition.height - padding + 4;
  context.fillStyle = 'rgba(255,255,255,0.16)';
  context.fillRect(padding, footerY - 42, maxTextWidth, 1);

  context.fillStyle = palette.accent;
  context.font = `600 ${Math.round(isWide ? 18 : 20)}px "Inter Variable", system-ui, sans-serif`;
  drawLetterSpacedText(context, 'LIN4CRE', padding, footerY, 4.5);

  context.fillStyle = 'rgba(247, 243, 234, 0.55)';
  context.font = `400 ${Math.round(isWide ? 18 : 20)}px "Inter Variable", system-ui, sans-serif`;
  const q = getCategory(quote.categories[0] ?? 'wisdom');
  const rightText = q ? q.name.toUpperCase() : 'QUOTES';
  const rightWidth = context.measureText(rightText).width;
  context.fillText(rightText, definition.width - padding - rightWidth, footerY);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Your browser could not encode the image.'));
    }, 'image/png');
  });
}
