import { describe, it, expect, vi, afterEach } from 'vitest';
import { createTodo } from './createTodo';

afterEach(() => {
  vi.unstubAllGlobals();
});

const dummyTodo = {
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
};

describe('createTodo', () => {
  it('POST /todos 로 입력값을 그대로 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyTodo), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const input = {
      title: '테스트 할일',
      startDate: '2026-08-27',
      endDate: '2026-08-28',
    };
    await createTodo(input);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/todos');
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify(input));
  });

  it('성공 응답(201)이면 Todo 객체를 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(dummyTodo), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await createTodo({
      title: '테스트 할일',
      startDate: '2026-08-27',
      endDate: '2026-08-28',
    });

    expect(result).toEqual(dummyTodo);
  });

  it('400 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'INVALID_DATE_RANGE', message: '종료일이 시작일보다 빠릅니다.' } }), {
        status: 400,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      createTodo({ title: '테스트 할일', startDate: '2026-08-28', endDate: '2026-08-27' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_DATE_RANGE',
      message: '종료일이 시작일보다 빠릅니다.',
    });
  });
});
