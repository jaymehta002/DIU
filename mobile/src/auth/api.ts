import { API_URL } from '../api/config';
import { getToken } from './tokenStorage';
import type { AuthUser } from './types';
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../types/api';

export class AuthRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

interface LoginResult extends AuthUser {
  token: string;
}

function isApiErrorEnvelope(body: unknown): body is ApiErrorEnvelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    'error' in body &&
    typeof (body as { error?: unknown }).error === 'object'
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new AuthRequestError('Received an invalid response from the server.', 'PARSE_ERROR', response.status);
  }

  if (!response.ok || isApiErrorEnvelope(body)) {
    const message = isApiErrorEnvelope(body) ? body.error.message : 'Request failed.';
    const code = isApiErrorEnvelope(body) ? body.error.code : 'UNKNOWN_ERROR';
    throw new AuthRequestError(message, code, response.status);
  }

  return (body as ApiSuccessEnvelope<T>).data;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    throw new AuthRequestError('Unable to reach the server. Check your connection.', 'NETWORK_ERROR', 0);
  }

  return parseResponse<LoginResult>(response);
}

export async function fetchMe(): Promise<AuthUser> {
  const token = await getToken();
  if (!token) {
    throw new AuthRequestError('No stored session.', 'NO_TOKEN', 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new AuthRequestError('Unable to reach the server. Check your connection.', 'NETWORK_ERROR', 0);
  }

  return parseResponse<AuthUser>(response);
}

export async function logout(): Promise<void> {
  const token = await getToken();
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).catch(() => {});
}
