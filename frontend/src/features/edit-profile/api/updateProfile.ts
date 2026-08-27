import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { User } from '../../../entities/user/model/types';

export interface UpdateProfileInput {
  name?: string;
  password?: string;
}

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const res = await apiFetch('/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json();

  if (!res.ok) {
    logDev('[updateProfile] failed', res.status, body.error);
    throw { status: res.status, code: body.error.code, message: body.error.message };
  }

  logDev('[updateProfile] success', body.id);
  return body as User;
}
