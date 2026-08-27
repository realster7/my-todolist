import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useCategories } from './useCategories';
import type { Category } from '../model/types';

afterEach(() => {
  vi.unstubAllGlobals();
});

const sample: Category[] = [{ id: '1', userId: 'u1', name: '업무', createdAt: '2026-08-27T00:00:00.000Z' }];

describe('useCategories', () => {
  it('카테고리 목록을 조회하여 data 로 반환한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(sample), { status: 200 })));

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCategories(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(sample);
  });
});
