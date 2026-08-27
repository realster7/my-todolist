import { logDev } from '../lib/logger';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const BASE_URL = API_BASE_URL;

let accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function rawFetch(path: string, options: RequestInit): Promise<Response> {
  const headers = new Headers(options.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });
}

export async function apiFetch(path: string, options: RequestInit = {}, isRetry = false): Promise<Response> {
  try {
    const res = await rawFetch(path, options);

    if (res.status !== 401 || isRetry || path === '/auth/refresh') {
      return res;
    }

    logDev('[httpClient] 401 received, attempting refresh', path);
    const refreshRes = await rawFetch('/auth/refresh', { method: 'POST' });

    if (!refreshRes.ok) {
      setAccessToken(null);
      logDev('[httpClient] refresh failed, re-login required');
      return res;
    }

    const { accessToken: newToken } = (await refreshRes.json()) as { accessToken: string };
    setAccessToken(newToken);
    logDev('[httpClient] access_token refreshed, retrying', path);
    return apiFetch(path, options, true);
  } catch (err) {
    logDev('[httpClient] request failed', path, err);
    throw err;
  }
}
