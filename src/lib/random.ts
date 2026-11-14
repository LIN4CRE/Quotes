/** Deterministic 32-bit FNV-1a hash. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Maps any key to a stable index in [0, length). */
export function deterministicIndex(key: string, length: number): number {
  if (length <= 0) return -1;
  return hashString(key) % length;
}

/** Fisher–Yates shuffle that returns a new array. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = result[index];
    const other = result[swapIndex];
    if (current === undefined || other === undefined) continue;
    result[index] = other;
    result[swapIndex] = current;
  }
  return result;
}

/**
 * Picks a random item, avoiding `exclude` when there is more than one option.
 * Returns undefined only for an empty list.
 */
export function pickRandom<T>(
  items: readonly T[],
  exclude?: (item: T) => boolean,
  random: () => number = Math.random,
): T | undefined {
  if (items.length === 0) return undefined;

  const candidates = exclude ? items.filter((item) => !exclude(item)) : items;
  const pool = candidates.length > 0 ? candidates : items;
  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);
  return pool[index];
}

/** Index for the quote of the day: stable for a given date key, different each day. */
export function dailyIndex(dateKey: string, length: number): number {
  if (length <= 0) return -1;
  // Offset by another hash so consecutive dates do not produce adjacent quotes.
  return (hashString(dateKey) ^ hashString(`lin4cre:${dateKey}`)) % length;
}
