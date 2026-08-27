import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';

export async function deleteTodo(id: string): Promise<void> {
  const res = await apiFetch(`/todos/${id}`, { method: 'DELETE' });

  if (!res.ok) {
    const body = await res.json();
    logDev('[deleteTodo] failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  logDev('[deleteTodo] success', id);
}
