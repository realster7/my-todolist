import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { Category } from '../model/types';

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiFetch('/categories');
  const body = await res.json();

  if (!res.ok) {
    logDev('[categoryApi] fetchCategories failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  return body as Category[];
}
