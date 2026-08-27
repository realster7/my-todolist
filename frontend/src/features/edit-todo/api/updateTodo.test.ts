import { describe, it, expect, vi, afterEach } from 'vitest';
import { updateTodo } from './updateTodo';

afterEach(() => {
  vi.unstubAllGlobals();
});

const dummyTodo = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '변경',
  description: null,
  startDate: '2026-08-27',
  endDate: '2026-08-28',
  isDone: false,
  completedAt: null,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
};

describe('updateTodo', () => {
  it('PATCH /todos/:id 로 입력값을 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyTodo), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const input = { title: '변경' };
    await updateTodo('t1', input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/todos/t1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toMatchObject(input);
  });

  it('성공 응답(200)이면 Todo 객체를 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyTodo), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await updateTodo('t1', { title: '변경' });

    expect(result).toEqual(dummyTodo);
  });

  it('403/404 실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: '수정 권한이 없습니다.' } }), {
        status: 403,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(updateTodo('t1', { title: '변경' })).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
      message: '수정 권한이 없습니다.',
    });
  });

  it('404 실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: '할일을 찾을 수 없습니다.' } }), {
        status: 404,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(updateTodo('t1', { title: '변경' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: '할일을 찾을 수 없습니다.',
    });
  });
});
