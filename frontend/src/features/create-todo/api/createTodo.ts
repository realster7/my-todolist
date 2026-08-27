import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { Todo } from '../../../entities/todo/model/types';

export interface CreateTodoInput {
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  categoryId?: string;
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  const res = await apiFetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json();

  if (!res.ok) {
    logDev('[createTodo] failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  logDev('[createTodo] success', body.id);
  return body as Todo;
}
