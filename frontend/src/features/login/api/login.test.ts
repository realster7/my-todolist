import { describe, it, expect, vi, afterEach } from 'vitest';
import { login } from './login';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('login', () => {
  it('POST /auth/login 으로 입력값을 그대로 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          accessToken: 'token-1',
          user: {
            id: '1',
            email: 'test@example.com',
            name: '홍길동',
            createdAt: '2026-08-27T00:00:00.000Z',
            updatedAt: '2026-08-27T00:00:00.000Z',
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const input = { email: 'test@example.com', password: 'password123' };
    await login(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/auth/login');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(input));
  });

  it('성공 응답(200)이면 accessToken/user를 resolve 한다', async () => {
    const responseBody = {
      accessToken: 'token-1',
      user: {
        id: '1',
        email: 'test@example.com',
        name: '홍길동',
        createdAt: '2026-08-27T00:00:00.000Z',
        updatedAt: '2026-08-27T00:00:00.000Z',
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(responseBody), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await login({ email: 'test@example.com', password: 'password123' });

    expect(result).toEqual(responseBody);
  });

  it('401 응답이면 status와 code를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } }),
        { status: 401 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      login({ email: 'wrong@example.com', password: 'wrongpass' }),
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });
});
