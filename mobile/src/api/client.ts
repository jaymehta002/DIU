import type { ApiErrorEnvelope, ApiSuccessEnvelope } from '../types/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    'EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set it to your backend\'s LAN IP.',
  );
}

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

  let response: Response;
  try {
    response = await fetch(url.toString());
  } catch {
    throw new ApiRequestError(
      'Unable to reach the server. Check the LAN IP in .env and your network connection.',
      'NETWORK_ERROR',
      0,
    );
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
