import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { fetchConstituencies } from '../api/constituencies';

export function useConstituencies() {
  const fetcher = useCallback(() => fetchConstituencies(), []);
  return useAsync(fetcher, []);
}
