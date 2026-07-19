import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../types/api';
import { API_URL } from './config';
import { getToken, clearToken } from '../auth/tokenStorage';
import { notifyUnauthorized } from '../auth/authEvents';

export class ApiRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function isApiErrorEnvelope(body: unknown): body is ApiErrorEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error?: unknown }).error === 'object'
  );
}

export async function apiRequest<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  const token = await getToken();

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch {
    throw new ApiRequestError(
      'Unable to reach the server. Check the LAN IP in .env and your network connection.',
      'NETWORK_ERROR',
      0,
    );
  }

  if (response.status === 401) {
    await clearToken();
    notifyUnauthorized();
    throw new ApiRequestError('Session expired.', 'UNAUTHORIZED', 401);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiRequestError('Received an invalid response from the server.', 'PARSE_ERROR', response.status);
  }

  if (!response.ok || isApiErrorEnvelope(body)) {
    const message = isApiErrorEnvelope(body) ? body.error.message : 'Request failed.';
    const code = isApiErrorEnvelope(body) ? body.error.code : 'UNKNOWN_ERROR';
    throw new ApiRequestError(message, code, response.status);
  }

  return (body as ApiSuccessEnvelope<T>).data;
}
