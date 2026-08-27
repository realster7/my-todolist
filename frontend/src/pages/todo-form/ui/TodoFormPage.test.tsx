import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TodoFormPage } from './TodoFormPage';

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

function stubFetch() {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('/categories')) {
      return Promise.resolve(new Response(JSON.stringify(categories), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function renderPage(initialEntry: string, queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/todos/new" element={<TodoFormPage />} />
          <Route path="/todos/:id/edit" element={<TodoFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TodoFormPage', () => {
  it('id 파라미터가 없으면 새 할일 등록 화면을 보여준다', async () => {
    stubFetch();

    renderPage('/todos/new');
    await screen.findByText('업무');

    expect(screen.getByText('새 할일 등록')).toBeInTheDocument();
    expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('');
  });

  it('id에 해당하는 todo가 캐시에 있으면 편집 화면을 프리필해서 보여준다', async () => {
    stubFetch();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['todos', {}], [mockTodo]);

    renderPage('/todos/t1/edit', queryClient);
    await screen.findByText('업무');

    expect(screen.getByText('할일 편집')).toBeInTheDocument();
    expect((screen.getByLabelText(/제목/) as HTMLInputElement).value).toBe('기존 제목');
  });

  it('id에 해당하는 todo가 캐시에 없으면 찾을 수 없다는 안내를 보여준다', async () => {
    stubFetch();

    renderPage('/todos/nonexistent/edit');

    expect(await screen.findByText(/할일을 찾을 수 없습니다/)).toBeInTheDocument();
  });
});
