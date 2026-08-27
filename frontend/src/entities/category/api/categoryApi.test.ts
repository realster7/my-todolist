import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchCategories } from './categoryApi';
import type { Category } from '../model/types';

afterEach(() => {
  vi.unstubAllGlobals();
});

const sample: Category[] = [{ id: '1', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' }];

describe('fetchCategories', () => {
  it('/categories 로 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchCategories();

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/categories');
  });

  it('성공 응답(200)이면 Category[] 를 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCategories();

    expect(result).toEqual(sample);
  });

  it('실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } }), {
        status: 401,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCategories()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
  });
});
