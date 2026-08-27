import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useTodos } from './useTodos';
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

describe('useTodos', () => {
  it('할일 목록을 조회하여 data 로 반환한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 })));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTodos(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sample);
  });
});
