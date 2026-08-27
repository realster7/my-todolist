import { describe, it, expect, vi, afterEach } from 'vitest';
import { deleteTodo } from './deleteTodo';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('deleteTodo', () => {
  it('DELETE /todos/:id 를 호출하고 204 응답이면 에러 없이 resolve 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteTodo('t1')).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/todos/t1');
    expect(init.method).toBe('DELETE');
  });

  it('403 실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' } }), {
        status: 403,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteTodo('t1')).rejects.toMatchObject({
      status: 403,
      code: 'FORBIDDEN',
      message: '삭제 권한이 없습니다.',
    });
  });

  it('404 실패 응답이면 status/code/message 를 포함한 에러로 reject 한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: '할일을 찾을 수 없습니다.' } }), {
        status: 404,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(deleteTodo('t1')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
      message: '할일을 찾을 수 없습니다.',
    });
  });
});
