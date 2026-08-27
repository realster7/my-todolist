import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchTodos } from './todoApi';
import type { TodoWithStatus } from '../model/types';

afterEach(() => {
  vi.unstubAllGlobals();
});

const sample: TodoWithStatus[] = [
  {
    id: '1',
    userId: 'u1',
    categoryId: 'c1',
    title: '테스트 할일',
    description: null,
    startDate: '2026-08-27',
    endDate: '2026-08-28',
    isDone: false,
    completedAt: null,
    createdAt: '2026-08-27T00:00:00.000Z',
    updatedAt: '2026-08-27T00:00:00.000Z',
    status: 'IN_PROGRESS',
  },
];

describe('fetchTodos', () => {
  it('파라미터가 없으면 /todos 로 쿼리스트링 없이 요청한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchTodos();

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/todos');
    expect(url).not.toContain('?');
  });

  it('category/status 파라미터를 쿼리스트링에 포함한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await fetchTodos({ category: 'cat-1', status: 'DONE' });

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('category=cat-1');
    expect(url).toContain('status=DONE');
  });

  it('성공 응답(200)이면 TodoWithStatus[] 를 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchTodos();

    expect(result).toEqual(sample);
  });

  it('실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' } }), {
        status: 401,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchTodos()).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHORIZED',
      message: '인증이 필요합니다.',
    });
  });
});
