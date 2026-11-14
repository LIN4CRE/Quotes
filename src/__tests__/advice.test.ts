import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdviceError, fetchAdvice, isOnline, validateAdvicePayload } from '@/services/advice';

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    ...response,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('Advice Slip client', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
  });

  it('fetches without caching and validates a good payload', async () => {
    const fetchMock = mockFetch({
      json: async () => ({ slip: { id: 42, advice: '  Take the long way home.  ' } }),
    });

    const payload = await fetchAdvice();

    expect(payload).toEqual({ id: '42', advice: 'Take the long way home.' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/api\.adviceslip\.com\/advice\?time=\d+$/);
    expect(options.cache).toBe('no-store');
    expect(options.headers).toEqual({ Accept: 'application/json' });
  });

  it('rejects when the browser is offline without making a request', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
    const fetchMock = mockFetch({});

    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'offline' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(isOnline()).toBe(false);
  });

  it('maps rate limiting and server errors to useful messages', async () => {
    mockFetch({ ok: false, status: 429 });
    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'rate-limit' });

    mockFetch({ ok: false, status: 503 });
    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'http' });
  });

  it('rejects malformed JSON and unexpected shapes', async () => {
    mockFetch({
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'malformed' });

    mockFetch({ json: async () => ({ slip: { advice: 12 } }) });
    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'malformed' });

    mockFetch({ json: async () => ({ nope: true }) });
    await expect(fetchAdvice()).rejects.toMatchObject({ code: 'malformed' });
  });

  it('treats network failures as recoverable network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const error = await fetchAdvice().catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(AdviceError);
    expect((error as AdviceError).code).toBe('network');
  });

  it('validates payload boundaries', () => {
    expect(validateAdvicePayload({ slip: { advice: 'Keep going.' } })).toEqual({
      id: expect.any(String),
      advice: 'Keep going.',
    });
    expect(validateAdvicePayload({ slip: { advice: '   ' } })).toBeNull();
    expect(validateAdvicePayload({ slip: { advice: 'x'.repeat(501) } })).toBeNull();
    expect(validateAdvicePayload({ slip: null })).toBeNull();
    expect(validateAdvicePayload(null)).toBeNull();
  });
});
