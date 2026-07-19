import { apiRequest } from './client';
import type { ConstituencySummary } from '../types/constituency';
import type { ConstituencyBoothsData } from '../types/booth';

export function fetchConstituencies(): Promise<ConstituencySummary[]> {
  return apiRequest<ConstituencySummary[]>('/constituencies');
}

export function fetchConstituencyBooths(constituencyId: string): Promise<ConstituencyBoothsData> {
  return apiRequest<ConstituencyBoothsData>(`/constituencies/${encodeURIComponent(constituencyId)}/booths`);
}
