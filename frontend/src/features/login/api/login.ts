import { apiFetch } from '../../../shared/api/httpClient';
import { logDev } from '../../../shared/lib/logger';
import type { User } from '../../../entities/user/model/types';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  user: User;
}

interface ApiError {
  status: number;
  code: string;
  message: string;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const body = await res.json();

  if (!res.ok) {
    logDev('[login] failed', res.status, body.error);
    const err: ApiError = { status: res.status, code: body.error.code, message: body.error.message };
    throw err;
  }

  logDev('[login] success', body.user?.id);
  return body as LoginResult;
}
