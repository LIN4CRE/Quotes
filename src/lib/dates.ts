const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatLongDate(date: Date): string {
  return dateFormatter.format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return shortDateFormatter.format(date);
}

export function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return `${dateFormatter.format(date)} at ${timeFormatter.format(date)}`;
}

/** Local calendar date as YYYY-MM-DD (not UTC, so the daily quote changes at local midnight). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown time';

  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 45) return 'Just now';
  if (seconds < 90) return 'A minute ago';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? 'An hour ago' : `${hours} hours ago`;

  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;

  return shortDateFormatter.format(date);
}

export function dayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  const key = toDateKey(date);
  if (key === toDateKey(now)) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (key === toDateKey(yesterday)) return 'Yesterday';

  return dateFormatter.format(date);
}
