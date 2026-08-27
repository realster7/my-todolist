import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { Todo } from '../../../entities/todo/model/types';

export interface UpdateTodoInput {
  title?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  isDone?: boolean;
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  const res = await apiFetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json();

  if (!res.ok) {
    logDev('[updateTodo] failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  logDev('[updateTodo] success', body.id);
  return body as Todo;
}
