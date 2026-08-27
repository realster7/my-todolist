import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TodoForm } from './TodoForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

const categories = [{ id: 'c1', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' }];

const dummyCreatedTodo = {
  id: 't1',
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

function stubFetch(postStatus = 201, postBody: unknown = dummyCreatedTodo) {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes('/categories')) {
      return Promise.resolve(new Response(JSON.stringify(categories), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify(postBody), { status: postStatus }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderTodoForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos/new']}>
        <Routes>
          <Route path="/todos/new" element={<TodoForm />} />
          <Route path="/todos" element={<div>할일 목록 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '테스트 할일' } });
  fireEvent.change(screen.getByLabelText(/시작일/), { target: { value: '2026-08-27' } });
  fireEvent.change(screen.getByLabelText(/종료일/), { target: { value: '2026-08-28' } });
}

function postCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url]) => !String(url).includes('/categories'));
}

describe('TodoForm', () => {
  it('제목/시작일/종료일을 입력하고 제출하면 POST /todos 로 올바른 body가 전송된다', async () => {
    const fetchMock = stubFetch();

    renderTodoForm();
    await screen.findByText('업무');
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(1));
    const [url, init] = postCalls(fetchMock)[0] as [string, RequestInit];
    expect(url).toContain('/todos');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toMatchObject({
      title: '테스트 할일',
      startDate: '2026-08-27',
      endDate: '2026-08-28',
    });
  });

  it('등록 성공 시 /todos 화면으로 이동한다', async () => {
    stubFetch();

    renderTodoForm();
    await screen.findByText('업무');
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(await screen.findByText('할일 목록 화면')).toBeInTheDocument();
  });

  it('종료일이 시작일보다 이전이면 에러 메시지를 보여주고 POST /todos 를 호출하지 않는다', async () => {
    const fetchMock = stubFetch();

    renderTodoForm();
    await screen.findByText('업무');
    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '테스트 할일' } });
    fireEvent.change(screen.getByLabelText(/시작일/), { target: { value: '2026-08-28' } });
    fireEvent.change(screen.getByLabelText(/종료일/), { target: { value: '2026-08-27' } });
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(postCalls(fetchMock)).toHaveLength(0);
  });

  it('카테고리를 선택하지 않고 제출해도 정상 등록된다', async () => {
    const fetchMock = stubFetch();

    renderTodoForm();
    await screen.findByText('업무');
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    await waitFor(() => expect(postCalls(fetchMock)).toHaveLength(1));
    const [, init] = postCalls(fetchMock)[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.categoryId).toBeUndefined();
  });

  it('서버가 400 에러를 반환하면 에러 메시지를 보여준다', async () => {
    stubFetch(400, { error: { code: 'INVALID_DATE_RANGE', message: '입력값이 올바르지 않습니다.' } });

    renderTodoForm();
    await screen.findByText('업무');
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(await screen.findByText('입력값이 올바르지 않습니다.')).toBeInTheDocument();
  });
});
