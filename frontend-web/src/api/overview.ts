import { apiRequest } from './client';
import type { Overview } from '../types/overview';

export function fetchOverview(): Promise<Overview> {
  return apiRequest<Overview>('/overview');
}
