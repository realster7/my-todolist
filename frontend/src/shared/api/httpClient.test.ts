import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch, setAccessToken, getAccessToken } from './httpClient';

function getHeaders(call: unknown[]): Headers {
  const init = call[1] as RequestInit | undefined;
  return new Headers(init?.headers);
}

afterEach(() => {
  vi.unstubAllGlobals();
  setAccessToken(null);
});

describe('httpClient', () => {
  it('includes Authorization header when an access token is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    setAccessToken('abc');
    await apiFetch('/todos');

    const headers = getHeaders(fetchMock.mock.calls[0]);
    expect(headers.get('Authorization')).toBe('Bearer abc');
  });

  it('does not include Authorization header when no access token is set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await apiFetch('/todos');

    const headers = getHeaders(fetchMock.mock.calls[0]);
    expect(headers.get('Authorization')).toBeNull();
  });

  it('retries the original request once after a successful refresh on 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: 'new-token' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiFetch('/todos');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/auth/refresh');
    expect(getAccessToken()).toBe('new-token');
    expect(res.status).toBe(200);
  });

  it('clears the access token and returns the original 401 when refresh fails', async () => {
    setAccessToken('stale-token');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiFetch('/todos');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessToken()).toBeNull();
    expect(res.status).toBe(401);
  });

  it('does not recurse infinitely when the retried request also returns 401', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ accessToken: 'new-token' }), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 401 }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await apiFetch('/todos');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(res.status).toBe(401);
  });
});
