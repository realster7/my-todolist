export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'code' in err && 'message' in err;
}
