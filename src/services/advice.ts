/**
 * Advice Slip integration (the useful part of the original g.html page).
 *
 * The public endpoint has no API key. Responses are treated as untrusted:
 * status codes, content type, JSON shape and text length are all checked before
 * anything reaches the UI. The service is deliberately network-only — cached
 * advice is stored as a user-owned entry with a saved timestamp, never passed
 * off as a fresh response.
 */

export const ADVICE_ENDPOINT = 'https://api.adviceslip.com/advice';

export type AdviceErrorCode =
  'offline' | 'http' | 'rate-limit' | 'malformed' | 'network' | 'timeout';

export class AdviceError extends Error {
  readonly code: AdviceErrorCode;

  constructor(code: AdviceErrorCode, message: string) {
    super(message);
    this.name = 'AdviceError';
    this.code = code;
  }
}

export interface AdvicePayload {
  id: string;
  advice: string;
}

const MAX_ADVICE_LENGTH = 500;
const TIMEOUT_MS = 10_000;

export function validateAdvicePayload(data: unknown): AdvicePayload | null {
  if (typeof data !== 'object' || data === null) return null;

  const slip = (data as { slip?: unknown }).slip;
  if (typeof slip !== 'object' || slip === null) return null;

  const record = slip as Record<string, unknown>;
  const advice = record.advice;

  if (typeof advice !== 'string') return null;

  const text = advice.trim();
  if (!text || text.length > MAX_ADVICE_LENGTH) return null;

  const rawId = record.id;
  const id =
    typeof rawId === 'number' && Number.isFinite(rawId)
      ? String(rawId)
      : typeof rawId === 'string' && rawId.trim()
        ? rawId.trim()
        : `${Date.now()}`;

  return { id, advice: text };
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export async function fetchAdvice(signal?: AbortSignal): Promise<AdvicePayload> {
  if (!isOnline()) {
    throw new AdviceError(
      'offline',
      'You appear to be offline. Your saved entries are still here.',
    );
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort('timeout'), TIMEOUT_MS);

  const abortFromCaller = () => controller.abort('cancelled');
  signal?.addEventListener('abort', abortFromCaller);

  try {
    const response = await fetch(`${ADVICE_ENDPOINT}?time=${Date.now()}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (response.status === 429) {
      throw new AdviceError(
        'rate-limit',
        'The advice service is rate-limiting requests. Try again in a minute.',
      );
    }

    if (!response.ok) {
      throw new AdviceError('http', `The advice service returned an error (${response.status}).`);
    }

    let data: unknown;
    try {
      data = (await response.json()) as unknown;
    } catch {
      throw new AdviceError('malformed', 'The advice service sent a response we could not read.');
    }

    const payload = validateAdvicePayload(data);

    if (!payload) {
      throw new AdviceError('malformed', 'The advice service sent an unexpected response.');
    }

    return payload;
  } catch (error) {
    if (error instanceof AdviceError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new AdviceError('timeout', 'The advice service took too long to respond.');
    }
    throw new AdviceError(
      'network',
      'Could not reach the advice service. Check your connection and try again.',
    );
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }
}
