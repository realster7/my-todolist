import { describe, it, expect, vi, afterEach } from 'vitest';
import { signUp } from './signUp';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('signUp', () => {
  it('POST /auth/signup 으로 입력값을 그대로 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '1',
          email: 'test@example.com',
          name: '홍길동',
          createdAt: '2026-08-27T00:00:00.000Z',
          updatedAt: '2026-08-27T00:00:00.000Z',
        }),
        { status: 201 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const input = { email: 'test@example.com', password: 'password123', name: '홍길동' };
    await signUp(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/auth/signup');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(input));
  });

  it('성공 응답(201)이면 User 객체를 resolve 한다', async () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      name: '홍길동',
      createdAt: '2026-08-27T00:00:00.000Z',
      updatedAt: '2026-08-27T00:00:00.000Z',
    };
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(user), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await signUp({ email: 'test@example.com', password: 'password123', name: '홍길동' });

    expect(result).toEqual(user);
  });

  it('409 응답이면 status와 code를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ error: { code: 'DUPLICATE_EMAIL', message: '이미 가입된 이메일입니다.' } }),
        { status: 409 },
      ),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      signUp({ email: 'dup@example.com', password: 'password123', name: '홍길동' }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'DUPLICATE_EMAIL',
    });
  });
});
