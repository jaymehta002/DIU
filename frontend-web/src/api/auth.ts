import { apiRequest } from './client';
import type { AuthUser } from '../types/user';

export function login(username: string, password: string): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/login', undefined, { method: 'POST', body: { username, password } });
}

export function logout(): Promise<void> {
  return apiRequest<void>('/auth/logout', undefined, { method: 'POST' });
}

export function fetchMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>('/auth/me');
}
