import { FolderPlus, Heart, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@/components/ui/Button';
import { formatShortDate } from '@/lib/dates';
import { cn } from '@/lib/cn';
import type { Reflection } from '@/types';

interface ReflectionCardProps {
  reflection: Reflection;
  onEdit: (reflection: Reflection) => void;
  onDelete: (reflection: Reflection) => void;
  onCollect: (reflection: Reflection) => void;
  onToggleFavourite: (reflection: Reflection) => void;
  compact?: boolean;
}

/**
 * Personal writing is visually and semantically separate from the quote
 * library: no attribution badge, no source line and an explicit "Your words"
 * label instead.
 */
export function ReflectionCard({
  reflection,
  onEdit,
  onDelete,
  onCollect,
  onToggleFavourite,
  compact = false,
}: ReflectionCardProps) {
  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 transition hover:border-line-strong',
        compact && 'rounded-2xl p-4',
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-[10px] font-medium tracking-wide text-ink uppercase">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Your words
        </span>
        <span className="text-[10.5px] text-subtle">{formatShortDate(reflection.updatedAt)}</span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton
            label={
              reflection.favourite ? 'Remove from favourite reflections' : 'Favourite reflection'
            }
            size="sm"
            aria-pressed={reflection.favourite}
            onClick={() => onToggleFavourite(reflection)}
          >
            <Heart
              className={cn('size-4', reflection.favourite && 'fill-current text-accent')}
              aria-hidden
            />
          </IconButton>
          <IconButton label="Edit reflection" size="sm" onClick={() => onEdit(reflection)}>
            <Pencil className="size-4" aria-hidden />
          </IconButton>
          <IconButton
            label="Add reflection to a collection"
            size="sm"
            onClick={() => onCollect(reflection)}
          >
            <FolderPlus className="size-4" aria-hidden />
          </IconButton>
          <IconButton label="Delete reflection" size="sm" onClick={() => onDelete(reflection)}>
            <Trash2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      {reflection.title ? (
        <h3 className={cn('mt-4 font-serif text-xl font-semibold text-ink', compact && 'text-lg')}>
          {reflection.title}
        </h3>
      ) : null}

      <blockquote className={cn('mt-3', !reflection.title && 'mt-4')}>
        <p
          className={cn(
            'font-serif text-[17px] leading-relaxed whitespace-pre-line text-ink',
            compact && 'text-[15px]',
          )}
        >
          {reflection.text}
        </p>
      </blockquote>

      <p className="mt-auto border-t border-line pt-3 text-[11px] text-subtle">
        {reflection.author ? `Attributed by you to ${reflection.author}` : 'Personal reflection'}
        <span aria-hidden> · </span>
        Not a historical quotation
      </p>
    </article>
  );
}
