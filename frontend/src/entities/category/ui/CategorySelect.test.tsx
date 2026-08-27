import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySelect } from './CategorySelect';
import type { Category } from '../model/types';

afterEach(() => {
  vi.unstubAllGlobals();
});

const sample: Category[] = [
  { id: 'c1', userId: 'u1', name: '기본', createdAt: '2026-08-27T00:00:00.000Z' },
  { id: 'c2', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' },
];

function renderWithClient(onChange: (value: string) => void, value = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CategorySelect value={value} onChange={onChange} />
    </QueryClientProvider>,
  );
}

describe('CategorySelect', () => {
  it('카테고리 옵션 목록을 렌더링한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 })));

    renderWithClient(vi.fn());

    expect(await screen.findByText('기본')).toBeInTheDocument();
    expect(await screen.findByText('업무')).toBeInTheDocument();
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('select 값 변경 시 onChange 가 호출된다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 })));
    const onChange = vi.fn();

    renderWithClient(onChange);
    await screen.findByText('업무');

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'c2' } });

    expect(onChange).toHaveBeenCalledWith('c2');
  });
});
