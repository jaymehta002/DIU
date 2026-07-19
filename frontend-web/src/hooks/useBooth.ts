import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { fetchBoothById } from '../api/booths';

export function useBooth(boothId: string | null) {
  const fetcher = useCallback(() => fetchBoothById(boothId as string), [boothId]);
  return useAsync(fetcher, [boothId], { skip: boothId === null });
}
