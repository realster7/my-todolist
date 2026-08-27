import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoFilterBar } from './TodoFilterBar';

afterEach(() => {
  vi.unstubAllGlobals();
});

const categories = [
  { id: 'c1', userId: 'u1', name: '기본', createdAt: '2026-08-27T00:00:00.000Z' },
  { id: 'c2', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' },
];

function renderFilterBar(props: Partial<Parameters<typeof TodoFilterBar>[0]> = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(categories), { status: 200 })));

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onCategoryChange = vi.fn();
  const onStatusChange = vi.fn();
  render(
    <QueryClientProvider client={queryClient}>
      <TodoFilterBar
        category={props.category ?? ''}
        status={props.status}
        onCategoryChange={props.onCategoryChange ?? onCategoryChange}
        onStatusChange={props.onStatusChange ?? onStatusChange}
      />
    </QueryClientProvider>,
  );
  return { onCategoryChange, onStatusChange };
}

describe('TodoFilterBar', () => {
  it('카테고리 select 옵션에 전체/기본/업무가 렌더링된다', async () => {
    renderFilterBar();

    expect(await screen.findByText('업무')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '전체' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '기본' })).toBeInTheDocument();
  });

  it('카테고리 select 값을 변경하면 onCategoryChange가 선택된 categoryId로 호출된다', async () => {
    const { onCategoryChange } = renderFilterBar();
    await screen.findByText('업무');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c2' } });

    expect(onCategoryChange).toHaveBeenCalledWith('c2');
  });

  it('"지연" 상태 버튼 클릭 시 onStatusChange가 OVERDUE로 호출된다', async () => {
    const { onStatusChange } = renderFilterBar();
    await screen.findByText('업무');

    fireEvent.click(screen.getByRole('button', { name: '지연' }));

    expect(onStatusChange).toHaveBeenCalledWith('OVERDUE');
  });

  it('"전체" 상태 버튼 클릭 시 onStatusChange가 undefined로 호출된다', async () => {
    const { onStatusChange } = renderFilterBar({ status: 'OVERDUE' });
    await screen.findByText('업무');

    fireEvent.click(screen.getByRole('button', { name: '전체' }));

    expect(onStatusChange).toHaveBeenCalledWith(undefined);
  });
});
