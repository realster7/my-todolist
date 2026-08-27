import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { TodoListPage } from './TodoListPage';
import { useAuthStore } from '../../../entities/user/model/authStore';

afterEach(() => {
  vi.unstubAllGlobals();
  useAuthStore.setState({ accessToken: null, user: null });
});

const categories = [
  { id: 'c1', userId: 'u1', name: '기본', createdAt: '2026-08-27T00:00:00.000Z' },
  { id: 'c2', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' },
];

const todos = [
  {
    id: 't1',
    userId: 'u1',
    categoryId: 'c1',
    title: '알고리즘 과제',
    description: null,
    startDate: '2026-09-01',
    endDate: '2026-09-07',
    isDone: false,
    completedAt: null,
    createdAt: '2026-08-27T00:00:00.000Z',
    updatedAt: '2026-08-27T00:00:00.000Z',
    status: 'IN_PROGRESS',
  },
];

function stubFetch(todosBody: unknown = todos) {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (String(url).includes('/categories')) {
      return Promise.resolve(new Response(JSON.stringify(categories), { status: 200 }));
    }
    if (String(url).includes('/todos')) {
      return Promise.resolve(new Response(JSON.stringify(todosBody), { status: 200 }));
    }
    return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function loginState() {
  useAuthStore.setState({
    accessToken: 't',
    user: { id: 'u1', email: 'a@example.com', name: '홍길동', createdAt: '', updatedAt: '' },
  });
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/todos']}>
        <Routes>
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/todos/new" element={<div>할일 등록 화면</div>} />
          <Route path="/login" element={<div>로그인 화면</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function todoCalls(fetchMock: ReturnType<typeof vi.fn>) {
  return fetchMock.mock.calls.filter(([url]) => String(url).includes('/todos'));
}

describe('TodoListPage', () => {
  it('초기 렌더 시 파라미터 없이 GET /todos를 호출하고 할일 제목을 보여준다', async () => {
    loginState();
    const fetchMock = stubFetch();

    renderPage();

    expect(await screen.findByText('알고리즘 과제')).toBeInTheDocument();
    const calls = todoCalls(fetchMock);
    expect(calls[0][0]).not.toContain('?');
  });

  it('카테고리 필터 선택 시 GET /todos?category=...로 재호출된다', async () => {
    loginState();
    const fetchMock = stubFetch();

    renderPage();
    await screen.findByText('알고리즘 과제');
    await screen.findByText('업무');

    fireEvent.change(screen.getByRole('combobox', { name: '카테고리' }), { target: { value: 'c2' } });

    await waitFor(() => {
      const last = todoCalls(fetchMock).at(-1);
      expect(String(last?.[0])).toContain('/todos?category=c2');
    });
  });

  it('"지연" 상태 필터 클릭 시 GET /todos?status=OVERDUE로 재호출된다', async () => {
    loginState();
    const fetchMock = stubFetch();

    renderPage();
    await screen.findByText('알고리즘 과제');

    fireEvent.click(screen.getByRole('button', { name: '지연' }));

    await waitFor(() => {
      const last = todoCalls(fetchMock).at(-1);
      expect(String(last?.[0])).toContain('/todos?status=OVERDUE');
    });
  });

  it('할일이 없으면 안내 문구를 보여준다', async () => {
    loginState();
    stubFetch([]);

    renderPage();

    expect(
      await screen.findByText('등록된 할일이 없습니다. 새 할일을 추가해 보세요.'),
    ).toBeInTheDocument();
  });

  it('캘린더 보기로 전환하면 목록 대신 달력이 보이고, 목록으로 다시 전환할 수 있다', async () => {
    loginState();
    stubFetch();

    renderPage();
    await screen.findByText('알고리즘 과제');

    fireEvent.click(screen.getByRole('button', { name: '캘린더' }));
    expect(screen.getByRole('button', { name: '다음 달' })).toBeInTheDocument();
    expect(screen.queryByText('2026-09-01 ~ 2026-09-07')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '목록' }));
    expect(await screen.findByText('알고리즘 과제')).toBeInTheDocument();
  });

  it('로그아웃 클릭 시 로그인 화면으로 전환되고 accessToken이 null이 된다', async () => {
    loginState();
    stubFetch();

    renderPage();
    await screen.findByText('알고리즘 과제');

    fireEvent.click(screen.getByText('로그아웃'));

    expect(await screen.findByText('로그인 화면')).toBeInTheDocument();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
