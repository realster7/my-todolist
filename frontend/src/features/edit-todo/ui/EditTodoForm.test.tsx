import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditTodoForm } from './EditTodoForm';

afterEach(() => {
  vi.unstubAllGlobals();
});

const categories = [{ id: 'c1', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' }];

const mockTodo = {
  id: 't1',
  userId: 'u1',
  categoryId: 'c1',
  title: '기존 제목',
  description: null,
  startDate: '2026-09-01',
  endDate: '2026-09-10',
  isDone: false,
  completedAt: null,
  createdAt: '2026-08-27T00:00:00.000Z',
  updatedAt: '2026-08-27T00:00:00.000Z',
  status: 'IN_PROGRESS' as const,
};

function stubFetch(
  patchStatus = 200,
  patchBody: unknown = mockTodo,
  deleteStatus = 204,
  deleteBody: unknown = null,
) {
  const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (String(url).includes('/categories')) {
      return Promise.resolve(new Response(JSON.stringify(categories), { status: 200 }));
    }
    if (init?.method === 'DELETE') {
      return Promise.resolve(new Response(deleteBody ? JSON.stringify(deleteBody) : null, { status: deleteStatus }));
    }
    return Promise.resolve(new Response(JSON.stringify(patchBody), { status: patchStatus }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function deleteCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === 'DELETE');
}

function renderEditTodoForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos/t1/edit']}>
        <Routes>
          <Route path="/todos/:id/edit" element={<EditTodoForm todo={mockTodo} />} />
          <Route path="/todos" element={<div>할일 목록 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function patchCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url]) => !String(url).includes('/categories'));
}

describe('EditTodoForm', () => {
  it('todo 값으로 제목 input이 프리필된다', async () => {
    stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');

    expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('기존 제목');
  });

  it('todo 값으로 시작일/종료일 input이 프리필된다', async () => {
    stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');

    expect((screen.getByLabelText(/시작일/) as HTMLInputElement).value).toBe('2026-09-01');
    expect((screen.getByLabelText(/종료일/) as HTMLInputElement).value).toBe('2026-09-10');
  });

  it('제목을 수정하고 저장하면 PATCH /todos/:id 가 변경된 title로 호출된다', async () => {
    const fetchMock = stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.change(screen.getByLabelText(/제목/), { target: { value: '변경된 제목' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(patchCalls(fetchMock)).toHaveLength(1));
    const [url, init] = patchCalls(fetchMock)[0] as [string, RequestInit];
    expect(url).toContain('/todos/t1');
    expect(init.method).toBe('PATCH');
    expect(JSON.parse(init.body as string)).toMatchObject({ title: '변경된 제목' });
  });

  it('완료 체크박스를 체크하고 저장하면 PATCH body에 isDone: true 가 포함된다', async () => {
    const fetchMock = stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByLabelText('완료 처리'));
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    await waitFor(() => expect(patchCalls(fetchMock)).toHaveLength(1));
    const [, init] = patchCalls(fetchMock)[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ isDone: true });
  });

  it('종료일이 시작일보다 이전이면 에러 메시지를 보여주고 PATCH를 호출하지 않는다', async () => {
    const fetchMock = stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.change(screen.getByLabelText(/종료일/), { target: { value: '2026-08-01' } });
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(patchCalls(fetchMock)).toHaveLength(0);
  });

  it('저장 성공 시 /todos 화면으로 이동한다', async () => {
    stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByRole('button', { name: '저장하기' }));

    expect(await screen.findByText('할일 목록 화면')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 삭제 확인 모달이 열린다', async () => {
    stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('할일을 삭제하시겠습니까?')).toBeInTheDocument();
  });

  it('삭제 모달에서 취소를 클릭하면 모달이 닫히고 DELETE 요청은 발생하지 않는다', async () => {
    const fetchMock = stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(deleteCalls(fetchMock)).toHaveLength(0);
  });

  it('삭제 모달에서 삭제하기를 클릭하면 DELETE /todos/:id 요청 후 /todos 화면으로 이동한다', async () => {
    const fetchMock = stubFetch();

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    await waitFor(() => expect(deleteCalls(fetchMock)).toHaveLength(1));
    const [url] = deleteCalls(fetchMock)[0] as [string, RequestInit];
    expect(url).toContain('/todos/t1');
    expect(await screen.findByText('할일 목록 화면')).toBeInTheDocument();
  });

  it('삭제 API가 403/404를 반환하면 모달에 에러 메시지가 표시되고 이동하지 않는다', async () => {
    const fetchMock = stubFetch(200, mockTodo, 403, {
      error: { code: 'FORBIDDEN', message: '삭제 권한이 없습니다.' },
    });

    renderEditTodoForm();
    await screen.findByText('업무');
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await screen.findByRole('dialog');
    fireEvent.click(screen.getByRole('button', { name: '삭제하기' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('삭제 권한이 없습니다.');
    expect(deleteCalls(fetchMock)).toHaveLength(1);
    expect(screen.queryByText('할일 목록 화면')).not.toBeInTheDocument();
  });
});
