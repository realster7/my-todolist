import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { TodoWithStatus, TodoStatus } from '../model/types';

export interface FetchTodosParams {
  category?: string;
  status?: TodoStatus;
}

export async function fetchTodos(params?: FetchTodosParams): Promise<TodoWithStatus[]> {
  const search = new URLSearchParams();
  if (params?.category) search.set('category', params.category);
  if (params?.status) search.set('status', params.status);
  const qs = search.toString();

  const res = await apiFetch(`/todos${qs ? `?${qs}` : ''}`);
  const body = await res.json();

  if (!res.ok) {
    logDev('[todoApi] fetchTodos failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  return body as TodoWithStatus[];
}
