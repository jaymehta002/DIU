import { useCallback } from 'react';
import { useAsync } from './useAsync';
import { fetchOverview } from '../api/overview';

export function useOverview() {
  const fetcher = useCallback(() => fetchOverview(), []);
  return useAsync(fetcher, []);
}
