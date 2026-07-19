import { apiRequest } from './client';
import type { BoothDetail, BoothSearchResult } from '../types/booth';

export function searchBooths(query: string): Promise<BoothSearchResult[]> {
  return apiRequest<BoothSearchResult[]>('/booths/search', { q: query });
}

export function fetchBoothById(boothId: string): Promise<BoothDetail> {
  return apiRequest<BoothDetail>(`/booths/${encodeURIComponent(boothId)}`);
}
