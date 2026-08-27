import { describe, it, expect, vi, afterEach } from 'vitest';
import { updateProfile } from './updateProfile';

afterEach(() => {
  vi.unstubAllGlobals();
});

const dummyUser = {
  id: 'u1',
  email: 'a@example.com',
  name: '변경된이름',
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
};

describe('updateProfile', () => {
  it('PATCH /users/me 로 입력값을 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyUser), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const input = { name: '변경된이름' };
    await updateProfile(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/users/me');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toMatchObject(input);
  });

  it('성공 응답(200)이면 User 객체를 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyUser), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await updateProfile({ name: '변경된이름' });

    expect(result).toEqual(dummyUser);
  });

  it('400 실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: '이름은 1~100자여야 합니다.' } }), {
        status: 400,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(updateProfile({ name: '' })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: '이름은 1~100자여야 합니다.',
    });
  });
});
