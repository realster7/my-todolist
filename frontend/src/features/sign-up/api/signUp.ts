import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { User } from '../../../entities/user/model/types';

interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

interface ApiError {
  status: number;
  code: string;
  message: string;
}

export async function signUp(input: SignUpInput): Promise<User> {
  const res = await apiFetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await res.json();

  if (!res.ok) {
    logDev('[signUp] failed', res.status, body.error);
    const err: ApiError = { status: res.status, code: body.error.code, message: body.error.message };
    throw err;
  }

  logDev('[signUp] success', body.id);
  return body as User;
}
